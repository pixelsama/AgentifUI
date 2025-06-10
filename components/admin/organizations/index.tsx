'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@lib/hooks/use-theme'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { Textarea } from '@components/ui/textarea'
import { 
  Building2, 
  Users, 
  Settings, 
  UserPlus, 
  Trash2, 
  UserMinus,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  Crown,
  UserIcon,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  Layers,
  Edit,
  ChevronDown
} from 'lucide-react'
import { cn } from '@lib/utils'
import AppPermissionsManagement from './app-permissions'
import toast from 'react-hot-toast'

// --- BEGIN COMMENT ---
// 现代化组织管理界面 - Stone风格设计
// 包含统计卡片、筛选功能、响应式布局
// --- END COMMENT ---

interface Organization {
  id: string
  name: string
  logo_url?: string
  settings: any
  created_at: string
  updated_at: string
}

interface OrgMember {
  id: string
  org_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  department?: string
  job_title?: string
  created_at: string
  updated_at: string
  user?: {
    full_name?: string
    username?: string
    email?: string
  }
}

interface OrgDepartmentInfo {
  org_id: string
  org_name: string
  department: string
  member_count: number
  has_permissions: boolean
  roles: string
}

interface OrgStats {
  totalOrganizations: number
  totalMembers: number
  totalDepartments: number
  organizationsWithPermissions: number
  avgMembersPerOrg: number
  topDepartments: Array<{ department: string; count: number }>
}

export default function OrganizationsManagement() {
  const { isDark } = useTheme()
  
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([])
  const [departmentInfo, setDepartmentInfo] = useState<OrgDepartmentInfo[]>([])
  const [orgStats, setOrgStats] = useState<OrgStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  // --- 对话框状态 ---
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false)
  const [isEditOrgOpen, setIsEditOrgOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  
  // --- 表单状态 ---
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    description: '',
    type: 'enterprise'
  })
  
  const [editOrgForm, setEditOrgForm] = useState({
    id: '',
    name: '',
    description: '',
    type: 'enterprise'
  })
  
  const [addUserForm, setAddUserForm] = useState({
    userId: '',
    orgId: '',
    department: '',
    jobTitle: '',
    role: 'member' as 'owner' | 'admin' | 'member'
  })

  // --- 用户数据 ---
  const [allUsers, setAllUsers] = useState<Array<{
    id: string
    full_name?: string
    username?: string
    email?: string
    avatar_url?: string
    role?: string
    status?: string
  }>>([])
  const [filteredUsers, setFilteredUsers] = useState<typeof allUsers>([])
  const [userSearchTerm, setUserSearchTerm] = useState('')

  // --- 计算组织统计数据 ---
  const calculateStats = (): OrgStats => {
    const totalOrganizations = organizations.length
    const totalMembers = orgMembers.length
    const totalDepartments = departmentInfo.length
    const organizationsWithPermissions = departmentInfo.filter(d => d.has_permissions).length
    const avgMembersPerOrg = totalOrganizations > 0 ? Math.round(totalMembers / totalOrganizations) : 0
    
    // 计算热门部门
    const deptCounts = departmentInfo.reduce((acc, dept) => {
      acc[dept.department] = (acc[dept.department] || 0) + dept.member_count
      return acc
    }, {} as Record<string, number>)
    
    const topDepartments = Object.entries(deptCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([department, count]) => ({ department, count }))
    
    return {
      totalOrganizations,
      totalMembers,
      totalDepartments,
      organizationsWithPermissions,
      avgMembersPerOrg,
      topDepartments
    }
  }

  // --- 数据获取函数 ---
  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/admin/organizations')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations || [])
      }
    } catch (error) {
      toast.error('获取组织列表失败')
      console.error('获取组织列表失败:', error)
    }
  }

  const fetchOrgMembers = async () => {
    try {
      const response = await fetch('/api/admin/organizations/members')
      if (response.ok) {
        const data = await response.json()
        setOrgMembers(data.members || [])
      }
    } catch (error) {
      toast.error('获取成员列表失败')
      console.error('获取成员列表失败:', error)
    }
  }

  const fetchDepartmentInfo = async () => {
    try {
      const response = await fetch('/api/admin/organizations/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartmentInfo(data.departments || [])
      }
    } catch (error) {
      toast.error('获取部门信息失败')
      console.error('获取部门信息失败:', error)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setAllUsers(data.users || [])
        setFilteredUsers(data.users || [])
      }
    } catch (error) {
      toast.error('获取用户列表失败')
      console.error('获取用户列表失败:', error)
    }
  }

  // --- 操作处理函数 ---
  const handleCreateOrganization = async () => {
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOrgForm.name,
          settings: { 
            description: newOrgForm.description,
            type: newOrgForm.type
          }
        }),
      })

      if (response.ok) {
        setIsCreateOrgOpen(false)
        setNewOrgForm({ name: '', description: '', type: 'enterprise' })
        await fetchOrganizations()
        toast.success('组织创建成功')
      } else {
        toast.error('创建组织失败')
      }
    } catch (error) {
      toast.error('创建组织失败')
      console.error('创建组织失败:', error)
    }
  }

  const handleEditOrganization = async () => {
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: editOrgForm.id,
          name: editOrgForm.name,
          settings: {
            description: editOrgForm.description,
            type: editOrgForm.type
          }
        }),
      })

      if (response.ok) {
        setIsEditOrgOpen(false)
        setEditOrgForm({ id: '', name: '', description: '', type: 'enterprise' })
        await fetchOrganizations()
        toast.success('组织更新成功')
      } else {
        toast.error('更新组织失败')
      }
    } catch (error) {
      toast.error('更新组织失败')
      console.error('更新组织失败:', error)
    }
  }

  const openEditDialog = (org: Organization) => {
    setEditOrgForm({
      id: org.id,
      name: org.name,
      description: org.settings?.description || '',
      type: org.settings?.type || 'enterprise'
    })
    setIsEditOrgOpen(true)
  }

  const handleAddUserToOrg = async () => {
    try {
      const response = await fetch('/api/admin/organizations/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addUserForm),
      })

      if (response.ok) {
        setIsAddUserOpen(false)
        setAddUserForm({
          userId: '',
          orgId: '',
          department: '',
          jobTitle: '',
          role: 'member'
        })
        setUserSearchTerm('')
        setFilteredUsers(allUsers)
        await fetchOrgMembers()
        await fetchDepartmentInfo()
        toast.success('成员添加成功')
      } else {
        const data = await response.json()
        toast.error(data.error || '添加成员失败')
      }
    } catch (error) {
      toast.error('添加成员失败')
      console.error('添加用户到组织失败:', error)
    }
  }

  // 用户搜索筛选
  const handleUserSearch = (searchTerm: string) => {
    setUserSearchTerm(searchTerm)
    if (!searchTerm.trim()) {
      setFilteredUsers(allUsers)
      return
    }
    
    const filtered = allUsers.filter(user => 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  const selectUser = (user: typeof allUsers[0]) => {
    setAddUserForm(prev => ({ ...prev, userId: user.id }))
    setUserSearchTerm(user.full_name || user.username || user.email || '')
    setFilteredUsers([])
  }

  const handleRemoveUserFromOrg = async (memberId: string) => {
    if (!confirm('确定要移除此成员吗？')) return

    try {
      const response = await fetch('/api/admin/organizations/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })

      if (response.ok) {
        await fetchOrgMembers()
        await fetchDepartmentInfo()
        toast.success('成员移除成功')
      } else {
        toast.error('移除成员失败')
      }
    } catch (error) {
      toast.error('移除成员失败')
      console.error('移除组织成员失败:', error)
    }
  }

  const handleDeleteOrganization = async (orgId: string, orgName: string) => {
    if (!confirm(`确定要删除组织"${orgName}"吗？此操作不可撤销。`)) return

    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }),
      })

      if (response.ok) {
        await fetchOrganizations()
        await fetchOrgMembers()
        await fetchDepartmentInfo()
        toast.success('组织删除成功')
      } else {
        const data = await response.json()
        toast.error(data.error || '删除组织失败')
      }
    } catch (error) {
      toast.error('删除组织失败')
      console.error('删除组织失败:', error)
    }
  }

  // --- 初始化数据 ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchOrganizations(),
        fetchOrgMembers(),
        fetchDepartmentInfo(),
        fetchAllUsers()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  // --- 计算统计数据 ---
  useEffect(() => {
    if (organizations.length > 0 || orgMembers.length > 0 || departmentInfo.length > 0) {
      setOrgStats(calculateStats())
    }
  }, [organizations, orgMembers, departmentInfo])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-stone-600" />
          <span className="text-stone-600 font-serif">加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "space-y-6 p-6",
      isDark ? "bg-stone-950" : "bg-stone-50"
    )}>
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(
            "text-2xl font-bold font-serif",
            isDark ? "text-stone-100" : "text-stone-900"
          )}>
            组织管理
          </h1>
          <p className={cn(
            "font-serif mt-1",
            isDark ? "text-stone-400" : "text-stone-600"
          )}>
            管理组织结构和成员关系
          </p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isCreateOrgOpen} onOpenChange={setIsCreateOrgOpen}>
            <DialogTrigger asChild>
              <Button className={cn(
                "font-serif",
                isDark ? "bg-stone-100 hover:bg-stone-200 text-stone-900" : "bg-stone-900 hover:bg-stone-800 text-white"
              )}>
                <Plus className="w-4 h-4 mr-2" />
                创建组织
              </Button>
            </DialogTrigger>
            <DialogContent className={cn(
              "max-w-md",
              isDark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"
            )}>
              <DialogHeader>
                <DialogTitle className={cn(
                  "font-serif",
                  isDark ? "text-stone-100" : "text-stone-900"
                )}>
                  创建新组织
                </DialogTitle>
                <DialogDescription className={cn(
                  "font-serif",
                  isDark ? "text-stone-400" : "text-stone-600"
                )}>
                  创建一个新的组织
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className={cn(
                    "font-serif",
                    isDark ? "text-stone-300" : "text-stone-700"
                  )}>
                    组织名称
                  </Label>
                  <Input
                    value={newOrgForm.name}
                    onChange={(e) => setNewOrgForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入组织名称"
                    className={cn(
                      "font-serif mt-1",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}
                  />
                </div>
                <div>
                  <Label className={cn(
                    "font-serif",
                    isDark ? "text-stone-300" : "text-stone-700"
                  )}>
                    描述
                  </Label>
                  <Textarea
                    value={newOrgForm.description}
                    onChange={(e) => setNewOrgForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入描述（可选）"
                    className={cn(
                      "font-serif mt-1",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}
                  />
                </div>
                <div>
                  <Label className={cn(
                    "font-serif",
                    isDark ? "text-stone-300" : "text-stone-700"
                  )}>
                    组织类型
                  </Label>
                  <Select
                    value={newOrgForm.type}
                    onValueChange={(value) => setNewOrgForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className={cn(
                      "font-serif mt-1",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"}>
                      <SelectItem value="enterprise" className="font-serif">企业</SelectItem>
                      <SelectItem value="government" className="font-serif">政府机构</SelectItem>
                      <SelectItem value="nonprofit" className="font-serif">非营利组织</SelectItem>
                      <SelectItem value="education" className="font-serif">教育机构</SelectItem>
                      <SelectItem value="other" className="font-serif">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateOrganization}
                  disabled={!newOrgForm.name.trim()}
                  className={cn(
                    "font-serif",
                    isDark ? "bg-stone-100 hover:bg-stone-200 text-stone-900" : "bg-stone-900 hover:bg-stone-800 text-white"
                  )}
                >
                  创建
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* --- 编辑组织对话框 --- */}
          <Dialog open={isEditOrgOpen} onOpenChange={setIsEditOrgOpen}>
            <DialogContent className={cn(
              "max-w-md",
              isDark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"
            )}>
              <DialogHeader>
                <DialogTitle className={cn(
                  "font-serif",
                  isDark ? "text-stone-100" : "text-stone-900"
                )}>
                  编辑组织
                </DialogTitle>
                <DialogDescription className={cn(
                  "font-serif",
                  isDark ? "text-stone-400" : "text-stone-600"
                )}>
                  修改组织的基本信息
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className={cn(
                    "font-serif",
                    isDark ? "text-stone-300" : "text-stone-700"
                  )}>
                    组织名称
                  </Label>
                  <Input
                    value={editOrgForm.name}
                    onChange={(e) => setEditOrgForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入组织名称"
                    className={cn(
                      "font-serif mt-1",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}
                  />
                </div>
                <div>
                  <Label className={cn(
                    "font-serif",
                    isDark ? "text-stone-300" : "text-stone-700"
                  )}>
                    组织描述
                  </Label>
                  <Textarea
                    value={editOrgForm.description}
                    onChange={(e) => setEditOrgForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入组织描述（可选）"
                    className={cn(
                      "font-serif mt-1",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}
                  />
                </div>
                <div>
                  <Label className={cn(
                    "font-serif",
                    isDark ? "text-stone-300" : "text-stone-700"
                  )}>
                    组织类型
                  </Label>
                  <Select
                    value={editOrgForm.type}
                    onValueChange={(value) => setEditOrgForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className={cn(
                      "font-serif mt-1",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"}>
                      <SelectItem value="enterprise" className="font-serif">企业</SelectItem>
                      <SelectItem value="government" className="font-serif">政府机构</SelectItem>
                      <SelectItem value="nonprofit" className="font-serif">非营利组织</SelectItem>
                      <SelectItem value="education" className="font-serif">教育机构</SelectItem>
                      <SelectItem value="other" className="font-serif">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleEditOrganization}
                  disabled={!editOrgForm.name.trim()}
                  className={cn(
                    "font-serif",
                    isDark ? "bg-stone-100 hover:bg-stone-200 text-stone-900" : "bg-stone-900 hover:bg-stone-800 text-white"
                  )}
                >
                  保存
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className={cn(
                "font-serif",
                isDark ? "border-stone-700 text-stone-300 hover:bg-stone-800" : "border-stone-300 text-stone-700 hover:bg-stone-50"
              )}>
                <UserPlus className="w-4 h-4 mr-2" />
                添加成员
              </Button>
            </DialogTrigger>
            <DialogContent className={cn(
              "max-w-md",
              isDark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"
            )}>
              <DialogHeader>
                <DialogTitle className={cn(
                  "font-serif",
                  isDark ? "text-stone-100" : "text-stone-900"
                )}>
                  添加成员
                </DialogTitle>
                <DialogDescription className={cn(
                  "font-serif",
                  isDark ? "text-stone-400" : "text-stone-600"
                )}>
                  将用户添加到组织和部门
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Label className={cn(
                    "font-serif",
                    isDark ? "text-stone-300" : "text-stone-700"
                  )}>
                    选择用户
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      value={userSearchTerm}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      placeholder="搜索用户姓名、用户名或邮箱"
                      className={cn(
                        "font-serif",
                        isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                      )}
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
                  </div>
                  
                  {/* 用户下拉列表 */}
                  {userSearchTerm && filteredUsers.length > 0 && (
                    <div className={cn(
                      "absolute z-50 w-full mt-1 max-h-60 overflow-auto border rounded-md shadow-lg",
                      isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"
                    )}>
                      {filteredUsers.slice(0, 10).map((user) => (
                        <div
                          key={user.id}
                          onClick={() => selectUser(user)}
                          className={cn(
                            "px-3 py-2 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700",
                            "flex items-center justify-between"
                          )}
                        >
                          <div>
                            <p className="font-medium font-serif text-stone-900 dark:text-stone-100">
                              {user.full_name}
                            </p>
                            <p className="text-sm text-stone-600 dark:text-stone-400 font-serif">
                              {user.username && `@${user.username}`} {user.email && `• ${user.email}`}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs font-serif"
                          >
                            {user.role}
                          </Badge>
                        </div>
                      ))}
                      {filteredUsers.length > 10 && (
                        <div className="px-3 py-2 text-sm text-stone-500 dark:text-stone-400 font-serif">
                          显示前10个结果，请继续输入以缩小范围
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 无搜索结果 */}
                  {userSearchTerm && filteredUsers.length === 0 && (
                    <div className={cn(
                      "absolute z-50 w-full mt-1 p-3 border rounded-md shadow-lg",
                      isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"
                    )}>
                      <p className="text-sm text-stone-500 dark:text-stone-400 font-serif">
                        未找到匹配的用户
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <Label className={cn(
                    "font-serif",
                    isDark ? "text-stone-300" : "text-stone-700"
                  )}>
                    组织
                  </Label>
                  <Select
                    value={addUserForm.orgId}
                    onValueChange={(value) => setAddUserForm(prev => ({ ...prev, orgId: value }))}
                  >
                    <SelectTrigger className={cn(
                      "font-serif mt-1",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}>
                      <SelectValue placeholder="选择组织" />
                    </SelectTrigger>
                    <SelectContent className={isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"}>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id} className="font-serif">
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={cn(
                    "font-serif",
                    isDark ? "text-stone-300" : "text-stone-700"
                  )}>
                    部门
                  </Label>
                  <Input
                    value={addUserForm.department}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="输入部门名称"
                    className={cn(
                      "font-serif mt-1",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}
                  />
                </div>
                <div>
                  <Label className={cn(
                    "font-serif",
                    isDark ? "text-stone-300" : "text-stone-700"
                  )}>
                    职位
                  </Label>
                  <Input
                    value={addUserForm.jobTitle}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="输入职位（可选）"
                    className={cn(
                      "font-serif mt-1",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}
                  />
                </div>
                <div>
                  <Label className={cn(
                    "font-serif",
                    isDark ? "text-stone-300" : "text-stone-700"
                  )}>
                    角色
                  </Label>
                  <Select
                    value={addUserForm.role}
                    onValueChange={(value: 'owner' | 'admin' | 'member') => 
                      setAddUserForm(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger className={cn(
                      "font-serif mt-1",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"}>
                      <SelectItem value="member" className="font-serif">成员</SelectItem>
                      <SelectItem value="admin" className="font-serif">管理员</SelectItem>
                      <SelectItem value="owner" className="font-serif">所有者</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddUserToOrg}
                  disabled={!addUserForm.userId.trim() || !addUserForm.orgId}
                  className={cn(
                    "font-serif",
                    isDark ? "bg-stone-100 hover:bg-stone-200 text-stone-900" : "bg-stone-900 hover:bg-stone-800 text-white"
                  )}
                >
                  添加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList className={cn(
          "grid w-full grid-cols-3",
          isDark ? "bg-stone-800 border-stone-700" : "bg-stone-100 border-stone-200"
        )}>
          <TabsTrigger 
            value="organizations" 
            className={cn(
              "font-serif",
              isDark 
                ? "data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100" 
                : "data-[state=active]:bg-white data-[state=active]:text-stone-900"
            )}
          >
            组织列表
          </TabsTrigger>
          <TabsTrigger 
            value="departments" 
            className={cn(
              "font-serif",
              isDark 
                ? "data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100" 
                : "data-[state=active]:bg-white data-[state=active]:text-stone-900"
            )}
          >
            部门管理
          </TabsTrigger>
          <TabsTrigger 
            value="permissions" 
            className={cn(
              "font-serif",
              isDark 
                ? "data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100" 
                : "data-[state=active]:bg-white data-[state=active]:text-stone-900"
            )}
          >
            权限配置
          </TabsTrigger>
        </TabsList>

        {/* --- 组织列表标签页 --- */}
        <TabsContent value="organizations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => {
              const orgMemberCount = orgMembers.filter(m => m.org_id === org.id).length
              const orgDepartments = departmentInfo.filter(d => d.org_id === org.id)
              
              return (
                <Card key={org.id} className={cn(
                  "border shadow-sm",
                  isDark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"
                )}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isDark ? "bg-stone-800" : "bg-stone-100"
                        )}>
                          <Building2 className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                        </div>
                        <div>
                          <CardTitle className="font-serif text-lg text-stone-900 dark:text-stone-100">
                            {org.name}
                          </CardTitle>
                          <CardDescription className="font-serif text-stone-600 dark:text-stone-400">
                            {org.settings?.description || '暂无描述'}
                          </CardDescription>
                          {org.settings?.type && (
                            <Badge variant="outline" className="text-xs font-serif mt-1">
                              {org.settings.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(org)}
                          className={cn(
                            "text-stone-600 border-stone-200 hover:bg-stone-50",
                            "dark:text-stone-400 dark:border-stone-700 dark:hover:bg-stone-800"
                          )}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteOrganization(org.id, org.name)}
                          className={cn(
                            "text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300",
                            "dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                          )}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-stone-500" />
                          <span className="text-sm font-serif text-stone-600 dark:text-stone-400">
                            {orgMemberCount} 成员
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Layers className="w-4 h-4 text-stone-500" />
                          <span className="text-sm font-serif text-stone-600 dark:text-stone-400">
                            {orgDepartments.length} 部门
                          </span>
                        </div>
                      </div>
                      
                      {orgDepartments.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-stone-700 dark:text-stone-300 font-serif mb-2">
                            部门：
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {orgDepartments.slice(0, 3).map((dept) => (
                              <Badge key={dept.department} variant="secondary" className="text-xs font-serif">
                                {dept.department}
                              </Badge>
                            ))}
                            {orgDepartments.length > 3 && (
                              <Badge variant="outline" className="text-xs font-serif">
                                +{orgDepartments.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {organizations.length === 0 && (
            <Card className={cn(
              "border-0 shadow-lg",
              isDark ? "bg-stone-800/50" : "bg-white/50"
            )}>
              <CardContent className="py-12">
                <div className="text-center">
                  <Building2 className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium font-serif text-stone-700 dark:text-stone-300 mb-2">
                    暂无组织
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 font-serif mb-4">
                    点击上方按钮创建第一个组织
                  </p>
                  <Button
                    onClick={() => setIsCreateOrgOpen(true)}
                    className={cn(
                      "font-serif",
                      isDark ? "bg-stone-100 hover:bg-stone-200 text-stone-900" : "bg-stone-900 hover:bg-stone-800 text-white"
                    )}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    创建第一个组织
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 部门管理 */}
        <TabsContent value="departments" className="space-y-4">
          <div className="space-y-4">
            {departmentInfo.map((dept) => {
              const deptMembers = orgMembers.filter(
                m => m.org_id === dept.org_id && m.department === dept.department
              )
              
              return (
                <Card key={`${dept.org_id}-${dept.department}`} className={cn(
                  "border shadow-sm",
                  isDark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"
                )}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isDark ? "bg-stone-800" : "bg-stone-100"
                        )}>
                          <Layers className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                        </div>
                        <div>
                          <CardTitle className="font-serif text-lg text-stone-900 dark:text-stone-100">
                            {dept.org_name} - {dept.department}
                          </CardTitle>
                          <CardDescription className="font-serif text-stone-600 dark:text-stone-400">
                            {dept.member_count} 名成员
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={dept.has_permissions ? "default" : "outline"} 
                        className="font-serif"
                      >
                        {dept.has_permissions ? '已配权限' : '未配权限'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {deptMembers.length > 0 ? (
                      <div className="space-y-2">
                        {deptMembers.map((member) => (
                          <div 
                            key={member.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border",
                              isDark ? "bg-stone-800 border-stone-700" : "bg-stone-50 border-stone-200"
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center",
                                member.role === 'owner' && "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
                                member.role === 'admin' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                                member.role === 'member' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              )}>
                                {member.role === 'owner' && <Crown className="w-4 h-4" />}
                                {member.role === 'admin' && <Shield className="w-4 h-4" />}
                                {member.role === 'member' && <UserIcon className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-medium font-serif text-stone-900 dark:text-stone-100">
                                  {member.user?.full_name || member.user?.username || '未知用户'}
                                </p>
                                <p className="text-sm text-stone-600 dark:text-stone-400 font-serif">
                                  {member.job_title || '暂无职位'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={
                                  member.role === 'owner' ? 'default' :
                                  member.role === 'admin' ? 'secondary' : 'outline'
                                }
                                className="font-serif text-xs"
                              >
                                {member.role === 'owner' && '所有者'}
                                {member.role === 'admin' && '管理员'}
                                {member.role === 'member' && '成员'}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveUserFromOrg(member.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <UserMinus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Users className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                        <p className="text-stone-600 dark:text-stone-400 font-serif">
                          该部门暂无成员
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {departmentInfo.length === 0 && (
            <Card className={cn(
              "border shadow-sm",
              isDark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"
            )}>
              <CardContent className="text-center py-12">
                <Layers className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium font-serif text-stone-900 dark:text-stone-100 mb-2">
                  暂无部门
                </h3>
                <p className="text-stone-600 dark:text-stone-400 font-serif mb-6">
                  添加成员到组织后会自动创建部门
                </p>
                <Button
                  onClick={() => setIsAddUserOpen(true)}
                  className={cn(
                    "font-serif",
                    isDark ? "bg-stone-100 hover:bg-stone-200 text-stone-900" : "bg-stone-900 hover:bg-stone-800 text-white"
                  )}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  添加第一个成员
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 权限配置 */}
        <TabsContent value="permissions">
          <AppPermissionsManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
} 