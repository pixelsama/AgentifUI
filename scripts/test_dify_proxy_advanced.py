# 文件路径: scripts/test_dify_proxy_advanced.py

import requests
import json
import os

# --- 配置 ---
# !! 修改为你本地代理的地址和要测试的 appId !!
PROXY_BASE_URL = "http://localhost:3000/api/dify"
APP_ID = "default" # 使用你配置了环境变量的那个 appId
USER_ID = "python-advanced-test" # 自定义用户标识

# --- 测试文件路径 (相对于脚本位置) ---
# !! 确保这些文件存在于脚本同级目录或修改为正确路径 !!
TEXT_FILE_PATH = os.path.join(os.path.dirname(__file__), '../files/dummy_upload.txt')
AUDIO_FILE_PATH = os.path.join(os.path.dirname(__file__), '../files/dummy_audio.mp3') # 如果测试音频上传

# --- 测试函数 ---

def test_file_upload():
    """测试 /files/upload (multipart/form-data)"""
    endpoint = "/files/upload"
    target_url = f"{PROXY_BASE_URL}/{APP_ID}{endpoint}"
    print(f"\n--- Testing File Upload ---")
    print(f"Target URL: {target_url}")

    if not os.path.exists(TEXT_FILE_PATH):
        print(f"ERROR: Test file not found at {TEXT_FILE_PATH}")
        return

    # 准备 multipart/form-data 请求
    # 'file' 是 Dify API 要求的字段名
    # 'user' 字段通过 data 参数传递
    files_payload = {
        'file': (os.path.basename(TEXT_FILE_PATH), open(TEXT_FILE_PATH, 'rb'), 'text/plain')
    }
    data_payload = {
        'user': USER_ID
    }

    try:
        # 发送请求，注意这里用 files 和 data 参数，requests 会自动处理 Content-Type
        with requests.post(target_url, files=files_payload, data=data_payload, timeout=30) as response:
            print(f"Response Status Code: {response.status_code}")

            response.raise_for_status() # 检查 HTTP 错误

            # 期望返回 JSON
            response_json = response.json()
            print("Response JSON:")
            print(json.dumps(response_json, indent=2))

            # 验证关键字段是否存在 (根据 Dify 文档)
            if 'id' in response_json and 'name' in response_json:
                print("SUCCESS: File upload seems successful.")
            else:
                print("WARNING: Response JSON structure might be unexpected.")

    except requests.exceptions.RequestException as e:
        print(f"ERROR during file upload request: {e}")
    except json.JSONDecodeError:
        print(f"ERROR: Response was not valid JSON. Response text: {response.text}")
    except Exception as e:
        print(f"ERROR during file upload test: {e}")
    finally:
        # 确保文件句柄关闭 (虽然 with open 已经做了)
        if 'file' in files_payload and hasattr(files_payload['file'][1], 'close'):
             files_payload['file'][1].close()

def test_audio_to_text():
    """测试 /audio-to-text (multipart/form-data)"""
    endpoint = "/audio-to-text"
    target_url = f"{PROXY_BASE_URL}/{APP_ID}{endpoint}"
    print(f"\n--- Testing Audio to Text ---")
    print(f"Target URL: {target_url}")

    if not os.path.exists(AUDIO_FILE_PATH):
        print(f"INFO: Audio file not found at {AUDIO_FILE_PATH}. Skipping test.")
        print("      Create a dummy audio file (e.g., dummy_audio.mp3) to run this test.")
        return

    files_payload = {
        'file': (os.path.basename(AUDIO_FILE_PATH), open(AUDIO_FILE_PATH, 'rb'), 'audio/mpeg') # 假设是 mp3
    }
    data_payload = {
        'user': USER_ID
    }

    try:
        with requests.post(target_url, files=files_payload, data=data_payload, timeout=60) as response: # 可能需要更长超时
            print(f"Response Status Code: {response.status_code}")
            response.raise_for_status()

            response_json = response.json()
            print("Response JSON:")
            print(json.dumps(response_json, indent=2))

            if 'text' in response_json:
                print(f"SUCCESS: Audio-to-text seems successful. Result: '{response_json['text']}'")
            else:
                print("WARNING: Response JSON structure might be unexpected.")

    except requests.exceptions.RequestException as e:
        print(f"ERROR during audio-to-text request: {e}")
    except json.JSONDecodeError:
        print(f"ERROR: Response was not valid JSON. Response text: {response.text}")
    except Exception as e:
        print(f"ERROR during audio-to-text test: {e}")
    finally:
         if 'file' in files_payload and hasattr(files_payload['file'][1], 'close'):
             files_payload['file'][1].close()


def test_text_to_audio():
    """测试 /text-to-audio (接收 audio/* 响应)"""
    endpoint = "/text-to-audio"
    target_url = f"{PROXY_BASE_URL}/{APP_ID}{endpoint}"
    print(f"\n--- Testing Text to Audio ---")
    print(f"Target URL: {target_url}")

    headers = {
        'Content-Type': 'application/json',
        # Accept header 不一定需要，服务器会决定返回类型
    }
    payload = {
        "text": "Hello from the Next.js proxy test.",
        "user": USER_ID
        # "message_id": "..." # 如果需要基于特定消息生成，则提供 message_id
    }
    output_audio_file = "output_audio.mp3" # 保存音频的文件名

    try:
        with requests.post(target_url, headers=headers, json=payload, timeout=60, stream=False) as response: # stream=False 因为我们要完整接收
            print(f"Response Status Code: {response.status_code}")
            response.raise_for_status()

            # 检查响应头 Content-Type
            content_type = response.headers.get('content-type')
            print(f"Response Content-Type: {content_type}")

            if content_type and content_type.startswith('audio/'):
                print(f"SUCCESS: Received audio content ({content_type}).")
                # 将接收到的音频数据写入文件
                with open(output_audio_file, 'wb') as f:
                    f.write(response.content) # response.content 包含原始字节
                print(f"Audio content saved to: {output_audio_file}")
                print(f"File size: {os.path.getsize(output_audio_file)} bytes")
            else:
                print(f"ERROR: Expected audio content, but received Content-Type: {content_type}")
                print(f"Response Text: {response.text[:200]}...") # 打印部分文本以供调试

    except requests.exceptions.RequestException as e:
        print(f"ERROR during text-to-audio request: {e}")
    except Exception as e:
        print(f"ERROR during text-to-audio test: {e}")

def test_get_conversations():
    """测试 GET /conversations (获取会话列表)"""
    endpoint = "/conversations"
    target_url = f"{PROXY_BASE_URL}/{APP_ID}{endpoint}"
    print(f"\n--- Testing Get Conversations ---")
    print(f"Target URL: {target_url}")

    # 准备查询参数
    params = {
        'user': USER_ID,
        'limit': 5 # 为了测试，请求少量数据
        # 'last_id': 'some_last_id' # 如果需要测试分页
    }

    try:
        # 发送 GET 请求，使用 params 参数传递查询字符串
        with requests.get(target_url, params=params, timeout=30) as response:
            print(f"Proxy Response Status Code: {response.status_code}")
            print("Proxy Response Headers:")
            for key, value in response.headers.items():
                print(f"  {key}: {value}")

            response.raise_for_status() # 检查 HTTP 错误

            # 期望返回 JSON
            response_json = response.json()
            print("Response JSON:")
            print(json.dumps(response_json, indent=2))

            # 验证基本结构
            if 'limit' in response_json and 'has_more' in response_json and 'data' in response_json and isinstance(response_json['data'], list):
                print(f"SUCCESS: Get conversations seems successful. Received {len(response_json['data'])} conversations.")
            else:
                print("WARNING: Response JSON structure might be unexpected.")

    except requests.exceptions.RequestException as e:
        # 检查是否是 IncompleteRead，如果是，打印已接收内容（如果可能）
        if isinstance(e.args[0], tuple) and len(e.args[0]) > 1 and 'IncompleteRead' in str(e.args[0][1]):
            print(f"ERROR during request (IncompleteRead): {e}")
            # 尝试打印部分接收到的内容
            if hasattr(e, 'partial') and e.partial:
                print(f"Partial content received: {e.partial}")
            elif response and hasattr(response, 'content') and response.content:
                print(f"Partial content received before error: {response.content}")
        else:
            print(f"ERROR during get conversations request: {e}")
    except json.JSONDecodeError:
        print(f"ERROR: Response was not valid JSON. Status: {response.status_code}. Response text: {response.text[:500]}...")
    except Exception as e:
        print(f"ERROR during get conversations test: {e}")


# --- 主执行逻辑 ---
if __name__ == "__main__":
    # 确保测试文件存在（至少是文本文件）
    if not os.path.exists(TEXT_FILE_PATH):
         print(f"Creating dummy text file at {TEXT_FILE_PATH} for testing...")
         with open(TEXT_FILE_PATH, "w") as f:
             f.write("This is a dummy file for upload testing.")

    # 按顺序执行测试
    test_file_upload()
    # test_audio_to_text()
    # test_text_to_audio()
    test_get_conversations()

    print("\n--- All Tests Finished ---")