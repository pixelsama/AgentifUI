// app/api/dify/[appId]/[...slug]/route.ts
export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { getDifyAppConfig } from '@/(lib)/config/difyConfig';

// 定义路由参数的接口
interface DifyApiParams {
  appId: string;
  slug: string[];
}

// --- 辅助函数：创建带有基本 CORS 和 Content-Type 的最小化响应头 ---
function createMinimalHeaders(contentType?: string): Headers {
  const headers = new Headers();
  // 设置基础的 CORS 头 (生产环境应配置更严格的源)
  headers.set('Access-Control-Allow-Origin', '*'); 
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 如果提供了 Content-Type，则设置它
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  return headers;
}

// --- 核心辅助函数：执行到 Dify 的代理请求 ---
async function proxyToDify(
  req: NextRequest, // 原始 Next.js 请求对象
  { params }: { params: DifyApiParams } // 直接解构 params
) {
  // 等待 params 解析完成后再访问其属性
  const appId = params.appId;
  const slug = params.slug;

  // --- BEGIN OPTIMIZATION: Validate slug --- 
  // 检查 slug 是否有效，防止构造无效的目标 URL
  if (!slug || slug.length === 0) {
    console.error(`[App: ${appId}] [${req.method}] Invalid request: Slug path is missing.`);
    return new Response(JSON.stringify({ error: 'Invalid request: slug path is missing.' }), {
      status: 400,
      headers: createMinimalHeaders('application/json') // 使用辅助函数
    });
  }
  // --- END OPTIMIZATION ---

  // 1. 获取特定 Dify 应用的配置
  console.log(`[App: ${appId}] [${req.method}] Attempting to get configuration...`);
  const difyConfig = await getDifyAppConfig(appId);

  // 2. 验证配置
  if (!difyConfig) {
    console.error(`[App: ${appId}] [${req.method}] Configuration not found.`);
    // 返回 400 Bad Request，表明客户端提供的 appId 无效或未配置
    return NextResponse.json(
      { error: `Configuration for Dify app '${appId}' not found.` },
      { status: 400 }
    );
  }

  const { apiKey: difyApiKey, apiUrl: difyApiUrl } = difyConfig;

  // 再次检查获取到的 key 和 url 是否有效
  if (!difyApiKey || !difyApiUrl) {
     console.error(`[App: ${appId}] [${req.method}] Invalid configuration loaded (missing key or URL).`);
     // 返回 500 Internal Server Error，表明服务器端配置问题
     return NextResponse.json({ error: `Server configuration error for app '${appId}'.` }, { status: 500 });
  }
  console.log(`[App: ${appId}] [${req.method}] Configuration loaded successfully.`);

  try {
    // 3. 构造目标 Dify URL
    const slugPath = slug.join('/');
    const targetUrl = `${difyApiUrl}/${slugPath}${req.nextUrl.search}`;
    console.log(`[App: ${appId}] [${req.method}] Proxying request to target URL: ${targetUrl}`);

    // 4. 准备转发请求头
    const headers = new Headers();
    // 只复制必要的请求头
    if (req.headers.get('Content-Type')) {
      headers.set('Content-Type', req.headers.get('Content-Type')!);
    }
    if (req.headers.get('Accept')) {
      headers.set('Accept', req.headers.get('Accept')!);
    }
    // 添加 Dify 认证头
    headers.set('Authorization', `Bearer ${difyApiKey}`);
    // 可以根据需要添加其他固定请求头

    // 5. 执行 fetch 请求转发
    // 准备请求体和头部，处理特殊情况
    let finalBody: BodyInit | null = req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null;
    const finalHeaders = new Headers(headers);
    const originalContentType = req.headers.get('Content-Type');

    // 特殊处理 multipart/form-data 请求（文件上传和语音转文本）
    if ((slugPath === 'files/upload' || slugPath === 'audio-to-text') && 
        originalContentType?.includes('multipart/form-data')) {
      console.log(`[App: ${appId}] [${req.method}] Handling multipart/form-data for ${slugPath}`);
      try {
        // 解析表单数据
        const formData = await req.formData();
        finalBody = formData;
        // 重要：移除 Content-Type，让 fetch 自动设置包含正确 boundary 的 multipart/form-data
        finalHeaders.delete('Content-Type');
      } catch (formError) {
        console.error(`[App: ${appId}] [${req.method}] Error parsing FormData:`, formError);
        return NextResponse.json(
          { error: 'Failed to parse multipart form data', details: (formError as Error).message },
          { status: 400 }
        );
      }
    }

    // 准备 fetch 选项
    const fetchOptions: RequestInit & { duplex: 'half' } = {
        method: req.method,
        headers: finalHeaders,
        body: finalBody,
        redirect: 'manual',
        cache: 'no-store',
        // 【重要】添加 duplex 选项并使用类型断言解决 TS(2769)
        duplex: 'half'
    };

    const response = await fetch(targetUrl, fetchOptions as any);
    console.log(`[App: ${appId}] [${req.method}] Dify response status: ${response.status}`);

    // --- BEGIN MODIFICATION / 开始修改 ---
    // 直接处理成功的 204 No Content 响应
    if (response.status === 204) {
      console.log(`[App: ${appId}] [${req.method}] 收到 204 No Content，直接转发响应.`);
      // 转发 204 状态和必要的响应头, 确保 body 为 null
      // 克隆需要转发的响应头
      const headersToForward = new Headers();
      response.headers.forEach((value, key) => {
         // 避免转发对 204 无意义或无效的头，如 content-length, content-type
         if (!['content-length', 'content-type', 'transfer-encoding'].includes(key.toLowerCase())) {
            headersToForward.set(key, value);
         }
      });
      // 添加 CORS 响应头 (根据需要调整源)
      headersToForward.set('Access-Control-Allow-Origin', '*'); 
      headersToForward.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      headersToForward.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // 返回 204 响应，body 必须为 null
      return new Response(null, {
        status: 204,
        statusText: 'No Content',
        headers: headersToForward
      });
    }
    // --- END MODIFICATION / 结束修改 ---

    // 6. 处理并转发 Dify 的响应
    if (response.ok && response.body) {
      const responseContentType = response.headers.get('content-type');
      
      // 处理流式响应（SSE）- SSE 需要保留原始头信息，包括 CORS
      if (responseContentType?.includes('text/event-stream')) {
        console.log(`[App: ${appId}] [${req.method}] Streaming response detected.`);
        // 保留 Dify 返回的 SSE 相关头，并补充我们标准的 CORS 头
        const sseHeaders = new Headers(response.headers); // 从原始响应复制
        sseHeaders.set('Access-Control-Allow-Origin', '*');
        sseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        sseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: sseHeaders, // 使用包含原始 SSE 头的 Headers
        });
      } 
      // 处理音频响应（文本转语音）- 通常也需要保留原始头
      else if (responseContentType?.startsWith('audio/')) {
        console.log(`[App: ${appId}] [${req.method}] Audio response detected.`);
        // 保留 Dify 返回的音频相关头，并补充 CORS 头
        const audioHeaders = new Headers(response.headers);
        audioHeaders.set('Access-Control-Allow-Origin', '*'); 
        audioHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        audioHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: audioHeaders, // 使用包含原始音频头的 Headers
        });
      }
      // 处理常规响应 (主要是 JSON 或 Text)
      else {
        // 处理非流式响应
        const responseData = await response.text();
        try {
          const jsonData = JSON.parse(responseData);
          console.log(`[App: ${appId}] [${req.method}] Returning native Response with minimal headers for success JSON.`);
          // --- REFACTOR: Use minimal header helper --- 
          return new Response(JSON.stringify(jsonData), {
            status: response.status,
            statusText: response.statusText,
            headers: createMinimalHeaders('application/json'), // 使用辅助函数
          });
          // --- END REFACTOR ---
        } catch (parseError) {
           // 非 JSON，返回文本
           console.log(`[App: ${appId}] [${req.method}] JSON parse failed, returning plain text with minimal headers.`);
           // --- REFACTOR: Use minimal header helper --- 
           const originalDifyContentType = response.headers.get('content-type') || 'text/plain';
           return new Response(responseData, {
               status: response.status,
               statusText: response.statusText,
               headers: createMinimalHeaders(originalDifyContentType), // 使用辅助函数，并传递原始类型
           });
           // --- END REFACTOR ---
        }
      }
    } else {
      // 处理无响应体或失败的情况
      if (!response.body) {
        console.log(`[App: ${appId}] [${req.method}] Empty response body with status: ${response.status}`);
      }
      // 尝试读取错误信息
      try {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          console.log(`[App: ${appId}] [${req.method}] Returning native Response with minimal headers for error JSON.`);
          // --- REFACTOR: Use minimal header helper --- 
          return new Response(JSON.stringify(errorJson), {
            status: response.status,
            statusText: response.statusText,
            headers: createMinimalHeaders('application/json'), // 使用辅助函数
          });
          // --- END REFACTOR ---
        } catch {
          // 错误响应不是 JSON，返回文本
          console.log(`[App: ${appId}] [${req.method}] Error response is not JSON, returning plain text with minimal headers.`);
          // --- REFACTOR: Use minimal header helper --- 
          const originalDifyErrorContentType = response.headers.get('content-type') || 'text/plain';
          return new Response(errorText, {
            status: response.status,
            statusText: response.statusText,
            headers: createMinimalHeaders(originalDifyErrorContentType), // 使用辅助函数
          });
          // --- END REFACTOR ---
        }
      } catch (readError) {
        // 如果连读取错误响应都失败了
        console.error(`[App: ${appId}] [${req.method}] Failed to read Dify error response body:`, readError);
        const finalErrorHeaders = createMinimalHeaders('application/json'); // 使用辅助函数
        return new Response(JSON.stringify({ error: `Failed to read Dify error response body. Status: ${response.status}`}), {
             status: 502,
             headers: finalErrorHeaders
        });
      }
    }
  } catch (error: any) {
    // 捕获 fetch 或响应处理中的错误
    console.error(`[App: ${appId}] [${req.method}] Dify proxy fetch/processing error:`, error);
    return NextResponse.json(
      { error: `Failed to connect or process response from Dify service for app '${appId}' during ${req.method}.`, details: error.message },
      { status: 502 } // 502 Bad Gateway
    );
  }
}

// --- 导出对应 HTTP 方法的处理函数 ---
// 直接将 proxyToDify 赋给需要支持的方法

export {
    proxyToDify as GET,
    proxyToDify as POST,
    proxyToDify as PUT,
    proxyToDify as DELETE,
    proxyToDify as PATCH
    // OPTIONS 通常由 Next.js 或 Vercel 自动处理 CORS 预检，但如果需要自定义可以添加
};

// --- BEGIN OPTIMIZATION: Explicit OPTIONS handler --- 
// 添加明确的 OPTIONS 请求处理函数，以确保 CORS 预检请求在各种部署环境下都能正确响应
export async function OPTIONS() {
  console.log('[OPTIONS Request] Responding to preflight request.');
  return new Response(null, {
    status: 204, // No Content for preflight
    headers: createMinimalHeaders() // 使用辅助函数设置 CORS 头
  });
}
// --- END OPTIMIZATION --- 