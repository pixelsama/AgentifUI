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
 * 上传单个文件到 Dify (通过后端代理)。
 *
 * @param appId - Dify 应用的 ID。
 * @param file - 要上传的 File 对象。
 * @param user - Dify 需要的用户标识符。
 * @returns 一个解析为 DifyFileUploadResponse 的 Promise。
 * @throws 如果请求失败或 API 返回错误状态，则抛出错误。
 */
// --- END COMMENT ---
export async function uploadDifyFile(
  appId: string,
  file: File,
  user: string
): Promise<DifyFileUploadResponse> {
  console.log(`[Dify File Service] Uploading file "${file.name}" for app ${appId}, user ${user}`);

  const slug = 'files/upload'; // Dify API 路径
  const apiUrl = `${DIFY_API_BASE_URL}/${appId}/${slug}`; // 构造代理 URL

  // --- BEGIN COMMENT ---
  // 创建 FormData 对象
  // --- END COMMENT ---
  const formData = new FormData();
  formData.append('file', file); // 'file' 是 Dify API 要求的字段名
  formData.append('user', user); // 'user' 也是 Dify API 要求的字段名

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      // --- BEGIN COMMENT ---
      // 不需要设置 Content-Type，fetch 会自动处理 FormData 的 boundary
      // 不需要设置 Authorization，代理会处理
      // --- END COMMENT ---
      body: formData,
    });

    console.log(`[Dify File Service] Upload response status for "${file.name}":`, response.status);

    if (!response.ok) {
      let errorBody = 'Unknown error';
      let errorCode = 'UNKNOWN';
      try {
        // 尝试解析 JSON 错误体
        const errorJson = await response.json();
        errorBody = JSON.stringify(errorJson);
        errorCode = errorJson.code || errorCode; // 尝试获取 Dify 的错误代码
      } catch (e) {
        // 如果不是 JSON，尝试读取文本
        try {
          errorBody = await response.text();
        } catch (readErr) {
          // 忽略读取错误
        }
      }
      // --- BEGIN COMMENT ---
      // 抛出包含更多信息的错误
      // --- END COMMENT ---
      const error = new Error(
        `Failed to upload file "${file.name}". Status: ${response.status} ${response.statusText}. Code: ${errorCode}. Body: ${errorBody}`
      );
      (error as any).code = errorCode; // 将 Dify 错误代码附加到错误对象
      throw error;
    }

    // --- BEGIN COMMENT ---
    // 解析成功的 JSON 响应体
    // --- END COMMENT ---
    const result: DifyFileUploadResponse = await response.json();
    console.log(`[Dify File Service] File "${file.name}" uploaded successfully. ID: ${result.id}`);
    return result;

  } catch (error) {
    console.error(`[Dify File Service] Error uploading file "${file.name}":`, error);
    // --- BEGIN COMMENT ---
    // 重新抛出错误，以便上层捕获
    // --- END COMMENT ---
    throw error;
  }
}

export {}
// 添加一个空的 export {} 确保它被视为一个模块 