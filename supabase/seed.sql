-- 插入默认组织
INSERT INTO organizations (id, name, logo_url)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '默认组织', 'https://via.placeholder.com/150');

-- 插入默认 AI 配置 (Dify)
INSERT INTO ai_configs (id, org_id, provider, app_id, api_key, api_url, settings)
VALUES
  (
    '00000000-0000-0000-0000-000000000001', 
    '00000000-0000-0000-0000-000000000001', 
    'dify',
    'default',
    'your_dify_api_key_here', -- 实际使用中应加密存储
    'https://api.dify.ai',
    '{"model": "gpt-3.5-turbo", "temperature": 0.7}'
  ); 