-- 改进级联删除逻辑，处理孤儿组织和AI配置问题

-- 1. 创建函数来处理组织成员删除后的清理工作
CREATE OR REPLACE FUNCTION handle_org_member_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- 检查删除成员后，组织是否还有其他成员
  IF NOT EXISTS (
    SELECT 1 FROM org_members 
    WHERE org_id = OLD.org_id 
    AND id != OLD.id
  ) THEN
    -- 如果没有其他成员，删除组织及其相关数据
    -- ai_configs 会因为 ON DELETE CASCADE 自动删除
    DELETE FROM organizations WHERE id = OLD.org_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 创建触发器，在删除组织成员时检查是否需要清理孤儿组织
DROP TRIGGER IF EXISTS cleanup_orphan_organizations ON org_members;
CREATE TRIGGER cleanup_orphan_organizations
  AFTER DELETE ON org_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_org_member_deletion();

-- 3. 创建函数来处理用户删除前的组织权限转移
CREATE OR REPLACE FUNCTION handle_user_deletion_prep()
RETURNS TRIGGER AS $$
DECLARE
  org_record RECORD;
  new_owner_id UUID;
BEGIN
  -- 查找用户是组织owner的所有组织
  FOR org_record IN 
    SELECT om.org_id 
    FROM org_members om 
    WHERE om.user_id = OLD.id 
    AND om.role = 'owner'
  LOOP
    -- 尝试找到该组织的其他admin成员来接管
    SELECT user_id INTO new_owner_id
    FROM org_members 
    WHERE org_id = org_record.org_id 
    AND user_id != OLD.id 
    AND role = 'admin'
    LIMIT 1;
    
    IF new_owner_id IS NOT NULL THEN
      -- 将admin提升为owner
      UPDATE org_members 
      SET role = 'owner', updated_at = CURRENT_TIMESTAMP
      WHERE org_id = org_record.org_id 
      AND user_id = new_owner_id;
    ELSE
      -- 如果没有admin，尝试找到普通成员提升
      SELECT user_id INTO new_owner_id
      FROM org_members 
      WHERE org_id = org_record.org_id 
      AND user_id != OLD.id 
      AND role = 'member'
      LIMIT 1;
      
      IF new_owner_id IS NOT NULL THEN
        -- 将member提升为owner
        UPDATE org_members 
        SET role = 'owner', updated_at = CURRENT_TIMESTAMP
        WHERE org_id = org_record.org_id 
        AND user_id = new_owner_id;
      END IF;
      -- 如果没有其他成员，组织将在成员删除后被自动清理
    END IF;
  END LOOP;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 创建触发器，在删除用户前处理组织权限转移
DROP TRIGGER IF EXISTS handle_user_deletion_prep ON auth.users;
CREATE TRIGGER handle_user_deletion_prep
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_deletion_prep();

-- 5. 添加约束确保每个组织至少有一个owner（可选，可能影响性能）
-- CREATE OR REPLACE FUNCTION check_organization_has_owner()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM org_members 
--     WHERE org_id = COALESCE(NEW.org_id, OLD.org_id) 
--     AND role = 'owner'
--   ) THEN
--     RAISE EXCEPTION '组织必须至少有一个所有者';
--   END IF;
--   RETURN COALESCE(NEW, OLD);
-- END;
-- $$ LANGUAGE plpgsql;

-- 6. 创建清理孤儿数据的维护函数（可定期执行）
CREATE OR REPLACE FUNCTION cleanup_orphan_data()
RETURNS void AS $$
BEGIN
  -- 清理没有成员的组织
  DELETE FROM organizations 
  WHERE id NOT IN (
    SELECT DISTINCT org_id 
    FROM org_members 
    WHERE org_id IS NOT NULL
  );
  
  -- 清理没有对话的孤儿消息（理论上不应该存在，但作为安全措施）
  DELETE FROM messages 
  WHERE conversation_id NOT IN (
    SELECT id FROM conversations
  );
  
  RAISE NOTICE '孤儿数据清理完成';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 刷新 Supabase 客户端缓存
NOTIFY pgrst, 'reload schema'; 