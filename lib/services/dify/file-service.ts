/**
 * Dify File Service
 * @description Implements interaction logic with Dify file upload API
 * @module lib/services/dify/file-service
 */
import type { DifyFileUploadResponse } from './types';

// Points to our backend proxy API
const DIFY_API_BASE_URL = '/api/dify';

/**
 * Upload a single file to Dify (via backend proxy), supporting progress callback.
 *
 * @param appId - Dify application ID.
 * @param file - File object to upload.
 * @param user - User identifier required by Dify.
 * @param onProgress - Upload progress callback (0-100).
 * @returns A Promise resolving to DifyFileUploadResponse.
 * @throws Throws an error if the request fails or API returns an error status.
 */
export async function uploadDifyFile(
  appId: string,
  file: File,
  user: string,
  onProgress?: (progress: number) => void
): Promise<DifyFileUploadResponse> {
  console.log(
    `[Dify File Service] Uploading file "${file.name}" for app ${appId}, user ${user}`
  );

  // Use XMLHttpRequest to support upload progress callback
  return new Promise((resolve, reject) => {
    const slug = 'files/upload';
    const apiUrl = `${DIFY_API_BASE_URL}/${appId}/${slug}`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', user);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl, true);

    // Listen for upload progress events
    xhr.upload.onprogress = event => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result: DifyFileUploadResponse = JSON.parse(xhr.responseText);
            console.log(
              `[Dify File Service] File "${file.name}" uploaded successfully. ID: ${result.id}`
            );
            resolve(result);
          } catch {
            reject(new Error('Failed to parse Dify file upload response'));
          }
        } else {
          let errorBody = xhr.responseText || 'Unknown error';
          let errorCode = 'UNKNOWN';
          try {
            const errorJson = JSON.parse(xhr.responseText);
            errorBody = JSON.stringify(errorJson);
            errorCode = errorJson.code || errorCode;
          } catch {}
          const error = new Error(
            `Failed to upload file "${file.name}". Status: ${xhr.status}. Code: ${errorCode}. Body: ${errorBody}`
          );
          (error as any).code = errorCode;
          reject(error);
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error(`File upload network error: ${xhr.status}`));
    };

    xhr.send(formData);
  });
}

export {};
// Ensure the file is treated as a module
