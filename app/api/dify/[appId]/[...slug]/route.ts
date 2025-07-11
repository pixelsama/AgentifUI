import { getDifyAppConfig } from '@lib/config/dify-config';
import { createClient } from '@lib/supabase/server';
import { isTextGenerationApp, isWorkflowApp } from '@lib/types/dify-app-types';

import { type NextRequest, NextResponse } from 'next/server';

// app/api/dify/[appId]/[...slug]/route.ts
export const dynamic = 'force-dynamic';

// 定义路由参数的接口
interface DifyApiParams {
  appId: string;
  slug: string[];
}

/**
 * 🎯 New: Function to adjust API path based on Dify app type
 * Different types of Dify apps use different API endpoints
 */
function adjustApiPathByAppType(
  slug: string[],
  appType: string | undefined
): string {
  const originalPath = slug.join('/');

  if (!appType) {
    return originalPath; // If no app type info, keep original path
  }

  // Workflow apps: need workflows prefix, but exclude common APIs
  if (isWorkflowApp(appType as any)) {
    // Common APIs like file upload, audio-to-text don't need workflows prefix
    const commonApis = ['files/upload', 'audio-to-text'];
    const isCommonApi = commonApis.some(api => originalPath.startsWith(api));

    if (!isCommonApi && !originalPath.startsWith('workflows/')) {
      return `workflows/${originalPath}`;
    }
  }

  // Text generation apps: use completion-messages endpoint
  if (isTextGenerationApp(appType as any)) {
    if (originalPath === 'messages' || originalPath === 'chat-messages') {
      return 'completion-messages';
    }
    if (originalPath.startsWith('chat-messages')) {
      return originalPath.replace('chat-messages', 'completion-messages');
    }
  }

  return originalPath;
}

// Helper function: create minimal response headers with Content-Type
function createMinimalHeaders(contentType?: string): Headers {
  const headers = new Headers();

  // Set Content-Type if provided
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  return headers;
}

// Core helper function: execute proxy request to Dify
async function proxyToDify(
  req: NextRequest, // Original Next.js request object
  // Modification point 1: receive context object containing params
  context: { params: Promise<DifyApiParams> } // Unified use of Promise type
) {
  // 🔒 Security: Authenticate user before processing request
  const supabase = await createClient();

  // Use getUser() to verify authentication with Supabase Auth server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log(
      `[Dify API] Unauthorized access attempt to appId: ${(await context.params).appId}`
    );
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Modification point 2: use await to get the value of params
  const params = await context.params;
  const appId = params.appId;
  const slug = params.slug;

  // 🎯 New: Check if there is temporary configuration (for form synchronization)
  // If the request body contains _temp_config, use temporary configuration instead of database configuration
  // 🎯 Fix: Avoid reading the request body repeatedly, clone the request to preserve the original request body
  let tempConfig: { apiUrl: string; apiKey: string } | null = null;
  let requestBody: any = null;

  if (req.method === 'POST') {
    try {
      // Clone request to avoid consuming original request body
      const clonedReq = req.clone();
      const body = await clonedReq.json();
      requestBody = body; // Save parsed request body

      if (
        body._temp_config &&
        body._temp_config.apiUrl &&
        body._temp_config.apiKey
      ) {
        tempConfig = body._temp_config;
        console.log(
          `[App: ${appId}] [${req.method}] 检测到临时配置，将使用表单提供的配置`
        );

        // Remove temporary configuration fields to avoid passing to Dify API
        const { _temp_config, ...cleanBody } = body;
        requestBody = cleanBody;
      }
    } catch (error) {
      // If parsing the request body fails, continue using normal process
      console.log(
        `[App: ${appId}] [${req.method}] Failed to parse request body, using normal configuration process`
      );
      requestBody = null;
    }
  }

  // Validate slug to prevent constructing invalid target URLs
  if (!slug || slug.length === 0) {
    console.error(
      `[App: ${appId}] [${req.method}] Invalid request: Slug path is missing.`
    );
    const baseResponse = new Response(
      JSON.stringify({ error: 'Invalid request: slug path is missing.' }),
      {
        status: 400,
        headers: createMinimalHeaders('application/json'), // Use helper function
      }
    );

    return baseResponse;
  }

  // 1. Get Dify app configuration
  // Use temporary configuration (form synchronization) first, otherwise get from database
  let difyApiKey: string;
  let difyApiUrl: string;
  let difyConfig: any = null;

  if (tempConfig) {
    // Use temporary configuration
    console.log(
      `[App: ${appId}] [${req.method}] Using temporary configuration`
    );
    difyApiKey = tempConfig.apiKey;
    difyApiUrl = tempConfig.apiUrl;
  } else {
    // Get configuration from database
    console.log(
      `[App: ${appId}] [${req.method}] Getting configuration from database...`
    );
    difyConfig = await getDifyAppConfig(appId);

    // Validate database configuration
    if (!difyConfig) {
      console.error(`[App: ${appId}] [${req.method}] Configuration not found.`);
      // Return 400 Bad Request, indicating that the provided appId is invalid or not configured
      const baseResponse = NextResponse.json(
        { error: `Configuration for Dify app '${appId}' not found.` },
        { status: 400 }
      );

      return baseResponse;
    }

    difyApiKey = difyConfig.apiKey;
    difyApiUrl = difyConfig.apiUrl;
  }

  // Check if the obtained key and url are valid again
  if (!difyApiKey || !difyApiUrl) {
    console.error(
      `[App: ${appId}] [${req.method}] Invalid configuration loaded (missing key or URL).`
    );
    // Return 500 Internal Server Error, indicating server-side configuration issues
    const baseResponse = NextResponse.json(
      { error: `Server configuration error for app '${appId}'.` },
      { status: 500 }
    );

    return baseResponse;
  }
  console.log(
    `[App: ${appId}] [${req.method}] Configuration loaded successfully.`
  );

  try {
    // 3. Construct target Dify URL
    const slugPath = adjustApiPathByAppType(slug, difyConfig?.appType);
    const targetUrl = `${difyApiUrl}/${slugPath}${req.nextUrl.search}`;
    console.log(
      `[App: ${appId}] [${req.method}] Proxying request to target URL: ${targetUrl}`
    );

    // 4. Prepare forwarding request headers
    const headers = new Headers();
    // Only copy necessary request headers
    if (req.headers.get('Content-Type')) {
      headers.set('Content-Type', req.headers.get('Content-Type')!);
    }
    if (req.headers.get('Accept')) {
      headers.set('Accept', req.headers.get('Accept')!);
    }
    // Add Dify authentication header
    headers.set('Authorization', `Bearer ${difyApiKey}`);
    // Add other fixed request headers as needed

    // 5. Execute fetch request forwarding
    // Prepare request body and headers, handle special cases
    let finalBody: BodyInit | null = null;

    // 🎯 Handle request body: use previously parsed and cleaned request body
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (tempConfig) {
        // When using temporary configuration, the request body should be empty (because these are info/parameters query requests)
        finalBody = null;
      } else if (requestBody !== null) {
        // Use previously parsed request body
        finalBody = JSON.stringify(requestBody);
      } else {
        // If no request body has been parsed, use the original request body
        finalBody = req.body;
      }
    }

    const finalHeaders = new Headers(headers);
    const originalContentType = req.headers.get('Content-Type');

    // Special handling for multipart/form-data requests (file upload and audio-to-text)
    if (
      (slugPath === 'files/upload' || slugPath === 'audio-to-text') &&
      originalContentType?.includes('multipart/form-data')
    ) {
      console.log(
        `[App: ${appId}] [${req.method}] Handling multipart/form-data for ${slugPath}`
      );
      try {
        // Parse form data
        const formData = await req.formData();
        finalBody = formData;
        // Important: remove Content-Type, let fetch automatically set multipart/form-data with correct boundary
        finalHeaders.delete('Content-Type');
      } catch (formError) {
        console.error(
          `[App: ${appId}] [${req.method}] Error parsing FormData:`,
          formError
        );
        return NextResponse.json(
          {
            error: 'Failed to parse multipart form data',
            details: (formError as Error).message,
          },
          { status: 400 }
        );
      }
    }

    // Prepare fetch options
    // 🎯 Temporary configuration requests should use GET method to call Dify API
    const actualMethod = tempConfig ? 'GET' : req.method;

    const fetchOptions: RequestInit & { duplex: 'half' } = {
      method: actualMethod,
      headers: finalHeaders,
      body: finalBody,
      redirect: 'manual',
      cache: 'no-store',
      // [Important] Add duplex option and use type assertion to solve TS(2769)
      duplex: 'half',
    };

    const response = await fetch(targetUrl, fetchOptions as any);
    console.log(
      `[App: ${appId}] [${req.method}] Dify response status: ${response.status}`
    );

    // Handle successful 204 No Content responses directly
    if (response.status === 204) {
      console.log(
        `[App: ${appId}] [${req.method}] Received 204 No Content, forwarding response directly.`
      );
      // Forward 204 status and necessary response headers, ensure body is null
      // Clone headers to forward
      const headersToForward = new Headers();
      response.headers.forEach((value, key) => {
        // Avoid forwarding headers meaningless or invalid for 204, such as content-length, content-type
        if (
          !['content-length', 'content-type', 'transfer-encoding'].includes(
            key.toLowerCase()
          )
        ) {
          headersToForward.set(key, value);
        }
      });

      // Return 204 response, body must be null, middleware will automatically add CORS headers
      const baseResponse = new Response(null, {
        status: 204,
        statusText: 'No Content',
        headers: headersToForward,
      });

      return baseResponse;
    }

    // 6. Handle and forward Dify'
    if (response.ok && response.body) {
      const responseContentType = response.headers.get('content-type');

      // Handle streaming responses (SSE) - use manual read/write for enhanced robustness
      if (responseContentType?.includes('text/event-stream')) {
        console.log(
          `[App: ${appId}] [${req.method}] Streaming response detected. Applying robust handling.`
        );

        // Keep SSE headers returned by Dify, and supplement our standard CORS headers
        const sseHeaders = createMinimalHeaders(); // Start with minimal CORS headers
        response.headers.forEach((value, key) => {
          // Copy essential SSE headers from Dify response
          if (
            key.toLowerCase() === 'content-type' ||
            key.toLowerCase() === 'cache-control' ||
            key.toLowerCase() === 'connection'
          ) {
            sseHeaders.set(key, value);
          }
        });

        // Create a new readable stream, used to manually push data blocks to the client
        const stream = new ReadableStream({
          async start(controller) {
            console.log(
              `[App: ${appId}] [${req.method}] SSE Stream: Starting to read from Dify.`
            );
            const reader = response.body!.getReader(); // Ensure response.body exists
            const decoder = new TextDecoder(); // Used for debugging log output

            // Handle client disconnection
            req.signal.addEventListener('abort', () => {
              console.log(
                `[App: ${appId}] [${req.method}] SSE Stream: Client disconnected, cancelling Dify read.`
              );
              reader.cancel('Client disconnected');
              // Note: controller may already be closed, trying to close here may cause an error, but is usually harmless
              try {
                controller.close();
              } catch {
                /* Ignore */
              }
            });

            try {
              while (true) {
                // Check if the client has disconnected
                if (req.signal.aborted) {
                  console.log(
                    `[App: ${appId}] [${req.method}] SSE Stream: Abort signal detected before read, stopping.`
                  );
                  // No need to manually cancel reader, cancel in addEventListener will handle it
                  break;
                }

                const { done, value } = await reader.read();

                if (done) {
                  console.log(
                    `[App: ${appId}] [${req.method}] SSE Stream: Dify stream finished.`
                  );
                  break; // Dify stream finished, exit loop
                }

                // Push the data block read from Dify to the stream we created
                controller.enqueue(value);
                // Optional: print decoded data blocks for debugging
                // console.log(`[App: ${appId}] [${req.method}] SSE Chunk:`, decoder.decode(value, { stream: true }));
              }
            } catch (error) {
              // If an error occurs while reading the Dify stream (e.g. Dify server disconnected)
              console.error(
                `[App: ${appId}] [${req.method}] SSE Stream: Error reading from Dify stream:`,
                error
              );
              // Trigger an error on the stream we created, notify downstream consumers
              controller.error(error);
            } finally {
              console.log(
                `[App: ${appId}] [${req.method}] SSE Stream: Finalizing stream controller.`
              );
              // Ensure the controller is closed regardless (if not already closed or errored)
              try {
                controller.close();
              } catch {
                /* Ignore if already closed or errored */
              }
              // Ensure reader is released (cancel will also release the lock, this is a double check)
              // reader.releaseLock(); // reader will automatically release after done=true or error
            }
          },
          cancel(reason) {
            console.log(
              `[App: ${appId}] [${req.method}] SSE Stream: Our stream was cancelled. Reason:`,
              reason
            );
            // If the stream we created is cancelled (e.g. cancel() is called on the Response object)
            // Theoretically, reader should already be cancelled in the abort event listener.
            // If needed, additional cleanup logic can be added here.
          },
        });

        // Return the response containing the stream we manually created, middleware will automatically add CORS headers
        const baseResponse = new Response(stream, {
          status: response.status,
          statusText: response.statusText,
          headers: sseHeaders,
        });

        return baseResponse;
      }

      // Handle audio response (text-to-speech) - keep simple direct pipe method
      else if (responseContentType?.startsWith('audio/')) {
        console.log(`[App: ${appId}] [${req.method}] Audio response detected.`);
        const audioHeaders = createMinimalHeaders(); // Start with minimal CORS
        response.headers.forEach((value, key) => {
          // Copy essential audio headers
          if (
            key.toLowerCase().startsWith('content-') ||
            key.toLowerCase() === 'accept-ranges' ||
            key.toLowerCase() === 'vary'
          ) {
            audioHeaders.set(key, value);
          }
        });
        // For one-time streams, direct pipe is usually efficient and stable enough, middleware will automatically add CORS headers
        const baseResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: audioHeaders,
        });

        return baseResponse;
      }
      // Handle regular response (mainly JSON or Text)
      else {
        // Handle non-streaming response
        const responseData = await response.text();
        try {
          const jsonData = JSON.parse(responseData);
          console.log(
            `[App: ${appId}] [${req.method}] Returning native Response with minimal headers for success JSON.`
          );
          // Use minimal header helper
          const baseResponse = new Response(JSON.stringify(jsonData), {
            status: response.status,
            statusText: response.statusText,
            headers: createMinimalHeaders('application/json'), // Use helper function
          });

          return baseResponse;
        } catch (parseError) {
          // Not JSON, return text
          console.log(
            `[App: ${appId}] [${req.method}] JSON parse failed, returning plain text with minimal headers.`
          );
          // Use minimal header helper
          const originalDifyContentType =
            response.headers.get('content-type') || 'text/plain';
          const baseResponse = new Response(responseData, {
            status: response.status,
            statusText: response.statusText,
            headers: createMinimalHeaders(originalDifyContentType), // Use helper function and pass original type
          });

          return baseResponse;
        }
      }
    } else {
      // Handle cases with no response body or failure
      if (!response.body) {
        console.log(
          `[App: ${appId}] [${req.method}] Empty response body with status: ${response.status}`
        );
      }
      // Try to read error information
      try {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          console.log(
            `[App: ${appId}] [${req.method}] Returning native Response with minimal headers for error JSON.`
          );
          // Use minimal header helper
          const baseResponse = new Response(JSON.stringify(errorJson), {
            status: response.status,
            statusText: response.statusText,
            headers: createMinimalHeaders('application/json'), // Use helper function
          });

          return baseResponse;
        } catch {
          // Error response is not JSON, return text
          console.log(
            `[App: ${appId}] [${req.method}] Error response is not JSON, returning plain text with minimal headers.`
          );
          // Use minimal header helper
          const originalDifyErrorContentType =
            response.headers.get('content-type') || 'text/plain';
          const baseResponse = new Response(errorText, {
            status: response.status,
            statusText: response.statusText,
            headers: createMinimalHeaders(originalDifyErrorContentType), // Use helper function
          });

          return baseResponse;
        }
      } catch (readError) {
        // If even reading the error response fails
        console.error(
          `[App: ${appId}] [${req.method}] Failed to read Dify error response body:`,
          readError
        );
        const finalErrorHeaders = createMinimalHeaders('application/json'); // Use helper function
        const baseResponse = new Response(
          JSON.stringify({
            error: `Failed to read Dify error response body. Status: ${response.status}`,
          }),
          {
            status: 502,
            headers: finalErrorHeaders,
          }
        );

        return baseResponse;
      }
    }
  } catch (error: any) {
    // Catch errors in fetch or response processing
    console.error(
      `[App: ${appId}] [${req.method}] Dify proxy fetch/processing error:`,
      error
    );
    const baseResponse = NextResponse.json(
      {
        error: `Failed to connect or process response from Dify service for app '${appId}' during ${req.method}.`,
        details: error.message,
      },
      { status: 502 } // 502 Bad Gateway
    );

    return baseResponse;
  }
}

// Export corresponding HTTP method handler functions
// Create handler functions that meet the requirements of Next.js 15 for each HTTP method

export async function GET(
  req: NextRequest,
  context: { params: Promise<DifyApiParams> }
) {
  return proxyToDify(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<DifyApiParams> }
) {
  return proxyToDify(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<DifyApiParams> }
) {
  return proxyToDify(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<DifyApiParams> }
) {
  return proxyToDify(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<DifyApiParams> }
) {
  return proxyToDify(req, context);
}

/**
 * Explicit OPTIONS handler
 * @description Adds explicit OPTIONS request handler to ensure CORS preflight requests respond correctly in various deployment environments
 */
export async function OPTIONS(req: NextRequest) {
  console.log('[OPTIONS Request] Responding to preflight request.');
  const baseResponse = new Response(null, {
    status: 204, // No Content for preflight
    headers: createMinimalHeaders(),
  });

  return baseResponse;
}
