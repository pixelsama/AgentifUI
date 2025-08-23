'use client';

import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { cn } from '@lib/utils';
import { Check, Search, Users, X } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
  last_sign_in: string | null;
  is_active: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  user_count: number;
  permissions: string[];
}

interface TargetSelectorProps {
  /** Selected user IDs */
  selectedUsers: string[];
  /** Selected role IDs */
  selectedRoles: string[];
  /** User selection change handler */
  onUsersChange: (userIds: string[]) => void;
  /** Role selection change handler */
  onRolesChange: (roleIds: string[]) => void;
  /** Whether selector is disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

const MOCK_ROLES: Role[] = [
  {
    id: 'user',
    name: '普通用户',
    description: '平台的普通用户，可以使用基本功能',
    user_count: 1250,
    permissions: ['read', 'chat', 'profile'],
  },
  {
    id: 'admin',
    name: '管理员',
    description: '系统管理员，拥有所有权限',
    user_count: 5,
    permissions: ['read', 'write', 'delete', 'admin'],
  },
  {
    id: 'developer',
    name: '开发者',
    description: '开发人员，可以访问API和开发工具',
    user_count: 23,
    permissions: ['read', 'write', 'api', 'debug'],
  },
  {
    id: 'tester',
    name: '测试人员',
    description: '负责测试产品功能的用户',
    user_count: 8,
    permissions: ['read', 'test', 'report'],
  },
  {
    id: 'support',
    name: '客服人员',
    description: '客户支持团队成员',
    user_count: 12,
    permissions: ['read', 'support', 'user_management'],
  },
];

const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: '系统管理员',
    role: 'admin',
    avatar_url: null,
    created_at: '2023-01-15T08:00:00Z',
    last_sign_in: '2024-01-20T10:30:00Z',
    is_active: true,
  },
  {
    id: '2',
    email: 'developer1@example.com',
    name: '张开发',
    role: 'developer',
    avatar_url: null,
    created_at: '2023-03-20T09:15:00Z',
    last_sign_in: '2024-01-20T14:22:00Z',
    is_active: true,
  },
  {
    id: '3',
    email: 'user1@example.com',
    name: '李用户',
    role: 'user',
    avatar_url: null,
    created_at: '2023-06-10T11:45:00Z',
    last_sign_in: '2024-01-19T16:18:00Z',
    is_active: true,
  },
  {
    id: '4',
    email: 'tester1@example.com',
    name: '王测试',
    role: 'tester',
    avatar_url: null,
    created_at: '2023-08-05T14:30:00Z',
    last_sign_in: '2024-01-20T09:45:00Z',
    is_active: true,
  },
  {
    id: '5',
    email: 'support1@example.com',
    name: '客服小助手',
    role: 'support',
    avatar_url: null,
    created_at: '2023-10-12T13:20:00Z',
    last_sign_in: '2024-01-20T11:15:00Z',
    is_active: true,
  },
  {
    id: '6',
    email: 'inactive@example.com',
    name: '未激活用户',
    role: 'user',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    last_sign_in: null,
    is_active: false,
  },
];

export function TargetSelector({
  selectedUsers,
  selectedRoles,
  onUsersChange,
  onRolesChange,
  disabled = false,
  className,
}: TargetSelectorProps) {
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Load users and roles data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setRoles(MOCK_ROLES);
      setLoading(false);
    }, 500);
  }, []);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery) return users;

    const query = userSearchQuery.toLowerCase();
    return users.filter(
      user =>
        user.email.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
  }, [users, userSearchQuery]);

  // Filter roles based on search query
  const filteredRoles = useMemo(() => {
    if (!roleSearchQuery) return roles;

    const query = roleSearchQuery.toLowerCase();
    return roles.filter(
      role =>
        role.name.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query)
    );
  }, [roles, roleSearchQuery]);

  // Handle role selection toggle
  const handleRoleToggle = (roleId: string) => {
    if (disabled) return;

    const newSelectedRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId];

    onRolesChange(newSelectedRoles);
  };

  // Handle user selection toggle
  const handleUserToggle = (userId: string) => {
    if (disabled) return;

    const newSelectedUsers = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];

    onUsersChange(newSelectedUsers);
  };

  // Handle select all roles
  const handleSelectAllRoles = () => {
    if (disabled) return;
    onRolesChange(filteredRoles.map(role => role.id));
  };

  // Handle clear all roles
  const handleClearAllRoles = () => {
    if (disabled) return;
    onRolesChange([]);
  };

  // Handle select all users
  const handleSelectAllUsers = () => {
    if (disabled) return;
    onUsersChange(
      filteredUsers.filter(user => user.is_active).map(user => user.id)
    );
  };

  // Handle clear all users
  const handleClearAllUsers = () => {
    if (disabled) return;
    onUsersChange([]);
  };

  // Get role name by ID
  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  // Calculate total target users
  const totalTargetUsers = useMemo(() => {
    const roleUserCounts = selectedRoles.reduce((sum, roleId) => {
      const role = roles.find(r => r.id === roleId);
      return sum + (role ? role.user_count : 0);
    }, 0);

    const individualUserCount = selectedUsers.length;

    return roleUserCounts + individualUserCount;
  }, [selectedRoles, selectedUsers, roles]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-stone-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          通知目标选择
        </CardTitle>
        <div className="text-sm text-stone-600 dark:text-stone-400">
          已选择 {totalTargetUsers} 个目标用户
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab Selector */}
        <div className="flex space-x-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
          <button
            onClick={() => setActiveTab('roles')}
            disabled={disabled}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activeTab === 'roles'
                ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-gray-100'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-gray-100'
            )}
          >
            按角色选择 ({selectedRoles.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            disabled={disabled}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activeTab === 'users'
                ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-gray-100'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-gray-100'
            )}
          >
            按用户选择 ({selectedUsers.length})
          </button>
        </div>

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-4">
            {/* Search and Actions */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  value={roleSearchQuery}
                  onChange={e => setRoleSearchQuery(e.target.value)}
                  placeholder="搜索角色..."
                  className="pl-10"
                  disabled={disabled}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllRoles}
                disabled={disabled || filteredRoles.length === 0}
              >
                全选
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllRoles}
                disabled={disabled || selectedRoles.length === 0}
              >
                清空
              </Button>
            </div>

            {/* Role List */}
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {filteredRoles.map(role => (
                <div
                  key={role.id}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors',
                    selectedRoles.includes(role.id)
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                      : 'border-stone-200 hover:border-stone-300 dark:border-stone-700 dark:hover:border-stone-600',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                  onClick={() => handleRoleToggle(role.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border-2',
                        selectedRoles.includes(role.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-stone-300 dark:border-stone-600'
                      )}
                    >
                      {selectedRoles.includes(role.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-stone-900 dark:text-gray-100">
                        {role.name}
                      </div>
                      <div className="text-sm text-stone-600 dark:text-stone-400">
                        {role.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-400">
                    {role.user_count} 用户
                  </div>
                </div>
              ))}

              {filteredRoles.length === 0 && (
                <div className="py-4 text-center text-stone-500 dark:text-stone-400">
                  {roleSearchQuery ? '没有找到匹配的角色' : '暂无角色'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Actions */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  placeholder="搜索用户邮箱或姓名..."
                  className="pl-10"
                  disabled={disabled}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllUsers}
                disabled={
                  disabled ||
                  filteredUsers.filter(u => u.is_active).length === 0
                }
              >
                全选
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllUsers}
                disabled={disabled || selectedUsers.length === 0}
              >
                清空
              </Button>
            </div>

            {/* User List */}
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-3 transition-colors',
                    user.is_active ? 'cursor-pointer' : 'opacity-50',
                    selectedUsers.includes(user.id)
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                      : 'border-stone-200 hover:border-stone-300 dark:border-stone-700 dark:hover:border-stone-600',
                    disabled && 'cursor-not-allowed'
                  )}
                  onClick={() => user.is_active && handleUserToggle(user.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border-2',
                        selectedUsers.includes(user.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-stone-300 dark:border-stone-600'
                      )}
                    >
                      {selectedUsers.includes(user.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.name || user.email}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                          {user.name?.charAt(0) ||
                            user.email.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-stone-900 dark:text-gray-100">
                        {user.name || '未设置姓名'}
                      </div>
                      <div className="text-sm text-stone-600 dark:text-stone-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      )}
                    >
                      {getRoleName(user.role)}
                    </div>
                    {!user.is_active && (
                      <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                        未激活
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="py-4 text-center text-stone-500 dark:text-stone-400">
                  {userSearchQuery ? '没有找到匹配的用户' : '暂无用户'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selection Summary */}
        {(selectedRoles.length > 0 || selectedUsers.length > 0) && (
          <div className="border-t border-stone-200 pt-4 dark:border-stone-700">
            <div className="mb-2 text-sm font-medium text-stone-900 dark:text-gray-100">
              选择摘要
            </div>
            <div className="space-y-2">
              {selectedRoles.length > 0 && (
                <div>
                  <span className="text-sm text-stone-600 dark:text-stone-400">
                    角色:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedRoles.map(roleId => (
                      <span
                        key={roleId}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {getRoleName(roleId)}
                        <button
                          onClick={() => handleRoleToggle(roleId)}
                          disabled={disabled}
                          className="rounded-sm p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedUsers.length > 0 && (
                <div>
                  <span className="text-sm text-stone-600 dark:text-stone-400">
                    用户:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedUsers.map(userId => {
                      const user = users.find(u => u.id === userId);
                      return (
                        <span
                          key={userId}
                          className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        >
                          {user?.name || user?.email || userId}
                          <button
                            onClick={() => handleUserToggle(userId)}
                            disabled={disabled}
                            className="rounded-sm p-0.5 hover:bg-green-200 dark:hover:bg-green-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TargetSelector;
