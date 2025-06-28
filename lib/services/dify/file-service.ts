// --- BEGIN COMMENT ---
// lib/services/dify/file-service.ts
// 实现与 Dify 文件上传 API 的交互逻辑。
// --- END COMMENT ---
import type { DifyFileUploadResponse } from './types';

// --- BEGIN COMMENT ---
// 指向我们的后端代理 API
// --- END COMMENT ---
const DIFY_API_BASE_URL = '/api/dify';

// --- BEGIN COMMENT ---
/**
 * 上传单个文件到 Dify (通过后端代理)，支持进度回调。
 *
 * @param appId - Dify 应用的 ID。
 * @param file - 要上传的 File 对象。
 * @param user - Dify 需要的用户标识符。
 * @param onProgress - 上传进度回调 (0-100)
 * @returns 一个解析为 DifyFileUploadResponse 的 Promise。
 * @throws 如果请求失败或 API 返回错误状态，则抛出错误。
 */
// --- END COMMENT ---
export async function uploadDifyFile(
  appId: string,
  file: File,
  user: string,
  onProgress?: (progress: number) => void
): Promise<DifyFileUploadResponse> {
  console.log(
    `[Dify File Service] Uploading file "${file.name}" for app ${appId}, user ${user}`
  );

  // --- BEGIN COMMENT ---
  // 使用 XMLHttpRequest 以支持上传进度回调
  // --- END COMMENT ---
  return new Promise((resolve, reject) => {
    const slug = 'files/upload';
    const apiUrl = `${DIFY_API_BASE_URL}/${appId}/${slug}`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', user);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl, true);

    // --- BEGIN COMMENT ---
    // 监听上传进度
    // --- END COMMENT ---
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
          } catch (e) {
            reject(new Error('解析 Dify 文件上传响应失败'));
          }
        } else {
          let errorBody = xhr.responseText || 'Unknown error';
          let errorCode = 'UNKNOWN';
          try {
            const errorJson = JSON.parse(xhr.responseText);
            errorBody = JSON.stringify(errorJson);
            errorCode = errorJson.code || errorCode;
          } catch (e) {}
          const error = new Error(
            `Failed to upload file "${file.name}". Status: ${xhr.status}. Code: ${errorCode}. Body: ${errorBody}`
          );
          (error as any).code = errorCode;
          reject(error);
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error(`文件上传网络错误: ${xhr.status}`));
    };

    xhr.send(formData);
  });
}

export {};
// 添加一个空的 export {} 确保它被视为一个模块
