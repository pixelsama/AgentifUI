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

-- 插入示例SSO提供商配置
INSERT INTO sso_providers (id, name, protocol, settings, client_id, client_secret, metadata_url, enabled)
VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    'Azure AD 示例',
    'OIDC',
    '{"tenant_id": "common", "authorization_endpoint": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"}',
    'azure-client-id-example',
    'azure-client-secret-example',
    'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Google Workspace 示例',
    'OAuth2',
    '{"authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth"}',
    'google-client-id-example',
    'google-client-secret-example',
    'https://accounts.google.com/.well-known/openid-configuration',
    true
  );

-- 插入示例域名映射
INSERT INTO domain_sso_mappings (domain, sso_provider_id, enabled)
VALUES
  ('example.com', '00000000-0000-0000-0000-000000000002', true),
  ('google.com', '00000000-0000-0000-0000-000000000003', true); 