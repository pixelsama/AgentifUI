# scripts/test_dify_proxy_streaming.py

import requests
import json

# --- 配置 ---
PROXY_BASE_URL = "http://localhost:3000/api/dify/default"
ENDPOINT = "/chat-messages"
TARGET_URL = f"{PROXY_BASE_URL}{ENDPOINT}"

# --- 请求数据 ---
headers = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream' # 明确希望接收 SSE
    # 注意：这里不需要 Authorization 头
}

payload = {
    "inputs": {},
    "query": "What are the specs of the iPhone 13 Pro Max? Tell me more details.", # 可以换个问题测试
    "response_mode": "streaming", # 必须是 streaming
    "conversation_id": "",       # 根据需要填写
    "user": "python-test-script", # 可以自定义用户标识
    "files": [
      {
        "type": "image",
        "transfer_method": "remote_url",
        "url": "https://cloud.dify.ai/logo/logo-site.png"
      }
    ]
}

# --- 执行请求并处理流 ---
try:
    print(f"Sending POST request to: {TARGET_URL}")
    # 使用 stream=True 来接收流式响应
    with requests.post(TARGET_URL, headers=headers, json=payload, stream=True, timeout=60) as response:
        print(f"Response Status Code: {response.status_code}")
        response.raise_for_status() # 如果状态码不是 2xx，则抛出异常

        print("\n--- Streaming Response ---")
        # 迭代处理响应流的每一行
        # iter_lines 会自动处理换行符和解码 (默认 utf-8)
        for line in response.iter_lines(decode_unicode=True):
            if line: # 过滤掉 keep-alive 空行
                print(line)
                # --- 在这里可以添加更复杂的 SSE 解析逻辑 ---
                # 例如，检查 line.startswith('data: ') 并解析 JSON
                # if line.startswith('data: '):
                #     try:
                #         sse_data = json.loads(line[6:]) # 去掉 "data: " 前缀
                #         # 处理解析后的 sse_data (字典)
                #         print(f"Parsed SSE Data: {sse_data}")
                #         if sse_data.get("event") == "message_end":
                #             print("\n--- Stream End Event Received ---")
                #             break # 或者根据需要继续处理
                #     except json.JSONDecodeError:
                #         print(f"(Could not parse line as JSON: {line})")
        print("\n--- Stream Ended ---")

except requests.exceptions.RequestException as e:
    print(f"\nAn error occurred: {e}")
except Exception as e:
    print(f"\nA general error occurred: {e}")