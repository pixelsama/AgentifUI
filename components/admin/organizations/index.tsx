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
  Layers
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
  
  // --- 筛选和搜索状态 ---
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedOrg, setSelectedOrg] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'departments' | 'created'>('name')
  
  // --- 对话框状态 ---
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  
  // --- 表单状态 ---
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    description: ''
  })
  
  const [addUserForm, setAddUserForm] = useState({
    userId: '',
    orgId: '',
    department: '',
    jobTitle: '',
    role: 'member' as 'owner' | 'admin' | 'member'
  })

  // --- BEGIN COMMENT ---
  // 计算组织统计数据
  // --- END COMMENT ---
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

  // --- 操作处理函数 ---
  const handleCreateOrganization = async () => {
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOrgForm.name,
          settings: { description: newOrgForm.description }
        }),
      })

      if (response.ok) {
        setIsCreateOrgOpen(false)
        setNewOrgForm({ name: '', description: '' })
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

  // --- 筛选和排序逻辑 ---
  const filteredOrganizations = organizations
    .filter(org => {
      const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           org.settings?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    .sort((a, b) => {
      const aMembers = orgMembers.filter(m => m.org_id === a.id).length
      const bMembers = orgMembers.filter(m => m.org_id === b.id).length
      const aDepts = departmentInfo.filter(d => d.org_id === a.id).length
      const bDepts = departmentInfo.filter(d => d.org_id === b.id).length

      switch (sortBy) {
        case 'members': return bMembers - aMembers
        case 'departments': return bDepts - aDepts
        case 'created': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default: return a.name.localeCompare(b.name)
      }
    })

  const filteredDepartments = departmentInfo
    .filter(dept => {
      const matchesSearch = dept.org_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dept.department.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesOrg = selectedOrg === 'all' || dept.org_id === selectedOrg
      return matchesSearch && matchesOrg
    })

  const filteredMembers = orgMembers
    .filter(member => {
      const matchesSearch = member.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = selectedRole === 'all' || member.role === selectedRole
      const matchesOrg = selectedOrg === 'all' || member.org_id === selectedOrg
      return matchesSearch && matchesRole && matchesOrg
    })

  // --- 初始化数据 ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchOrganizations(),
        fetchOrgMembers(),
        fetchDepartmentInfo()
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
      isDark ? "bg-stone-950" : "bg-stone-50/50"
    )}>
      {/* --- 页面标题 --- */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 font-serif">
            组织管理
          </h1>
          <p className="text-stone-600 dark:text-stone-400 font-serif mt-1">
            管理组织结构、部门和成员关系
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog open={isCreateOrgOpen} onOpenChange={setIsCreateOrgOpen}>
            <DialogTrigger asChild>
              <Button className={cn(
                "bg-stone-900 hover:bg-stone-800 text-white font-serif shadow-lg",
                "dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900",
                "transition-all duration-200 hover:scale-105"
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
                <DialogTitle className="font-serif text-stone-900 dark:text-stone-100">
                  创建新组织
                </DialogTitle>
                <DialogDescription className="font-serif text-stone-600 dark:text-stone-400">
                  创建一个新的组织，可以包含多个部门和成员
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="org-name" className="font-serif text-stone-700 dark:text-stone-300">
                    组织名称
                  </Label>
                  <Input
                    id="org-name"
                    value={newOrgForm.name}
                    onChange={(e) => setNewOrgForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入组织名称"
                    className={cn(
                      "font-serif mt-1 transition-all duration-200",
                      "focus:ring-2 focus:ring-stone-500 focus:border-transparent",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="org-description" className="font-serif text-stone-700 dark:text-stone-300">
                    组织描述
                  </Label>
                  <Textarea
                    id="org-description"
                    value={newOrgForm.description}
                    onChange={(e) => setNewOrgForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入组织描述（可选）"
                    className={cn(
                      "font-serif mt-1 transition-all duration-200",
                      "focus:ring-2 focus:ring-stone-500 focus:border-transparent",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateOrganization}
                  disabled={!newOrgForm.name.trim()}
                  className={cn(
                    "bg-stone-900 hover:bg-stone-800 text-white font-serif",
                    "dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  创建组织
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className={cn(
                "border-stone-300 text-stone-700 hover:bg-stone-50 font-serif shadow-sm",
                "dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800",
                "transition-all duration-200 hover:scale-105"
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
                <DialogTitle className="font-serif text-stone-900 dark:text-stone-100">
                  添加用户到组织
                </DialogTitle>
                <DialogDescription className="font-serif text-stone-600 dark:text-stone-400">
                  将用户添加到指定组织和部门
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-id" className="font-serif text-stone-700 dark:text-stone-300">
                    用户ID
                  </Label>
                  <Input
                    id="user-id"
                    value={addUserForm.userId}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="输入用户ID"
                    className={cn(
                      "font-serif mt-1",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="org-select" className="font-serif text-stone-700 dark:text-stone-300">
                    选择组织
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
                  <Label htmlFor="department" className="font-serif text-stone-700 dark:text-stone-300">
                    部门
                  </Label>
                  <Input
                    id="department"
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
                  <Label htmlFor="job-title" className="font-serif text-stone-700 dark:text-stone-300">
                    职位
                  </Label>
                  <Input
                    id="job-title"
                    value={addUserForm.jobTitle}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="输入职位名称（可选）"
                    className={cn(
                      "font-serif mt-1",
                      isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="role-select" className="font-serif text-stone-700 dark:text-stone-300">
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
                    "bg-stone-900 hover:bg-stone-800 text-white font-serif",
                    "dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  添加成员
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* --- 统计卡片 --- */}
      {orgStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className={cn(
            "transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 shadow-sm",
            isDark ? "bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20" : "bg-gradient-to-br from-blue-50 to-blue-100/50"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 font-serif">总组织数</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 font-serif">
                    {orgStats.totalOrganizations}
                  </p>
                </div>
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-blue-500/20" : "bg-blue-100"
                )}>
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 shadow-sm",
            isDark ? "bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20" : "bg-gradient-to-br from-green-50 to-green-100/50"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 font-serif">总成员数</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300 font-serif">
                    {orgStats.totalMembers}
                  </p>
                </div>
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-green-500/20" : "bg-green-100"
                )}>
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 shadow-sm",
            isDark ? "bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20" : "bg-gradient-to-br from-purple-50 to-purple-100/50"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 font-serif">部门数</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 font-serif">
                    {orgStats.totalDepartments}
                  </p>
                </div>
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-purple-500/20" : "bg-purple-100"
                )}>
                  <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 shadow-sm",
            isDark ? "bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20" : "bg-gradient-to-br from-amber-50 to-amber-100/50"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400 font-serif">已配权限</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 font-serif">
                    {orgStats.organizationsWithPermissions}
                  </p>
                </div>
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-amber-500/20" : "bg-amber-100"
                )}>
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 shadow-sm",
            isDark ? "bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20" : "bg-gradient-to-br from-indigo-50 to-indigo-100/50"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 font-serif">平均成员</p>
                  <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 font-serif">
                    {orgStats.avgMembersPerOrg}
                  </p>
                </div>
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-indigo-500/20" : "bg-indigo-100"
                )}>
                  <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 shadow-sm",
            isDark ? "bg-gradient-to-br from-stone-500/10 to-stone-600/5 border border-stone-500/20" : "bg-gradient-to-br from-stone-50 to-stone-100/50"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-400 font-serif">热门部门</p>
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-300 font-serif truncate">
                    {orgStats.topDepartments[0]?.department || '暂无'}
                  </p>
                </div>
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-stone-500/20" : "bg-stone-100"
                )}>
                  <Calendar className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- 搜索和筛选栏 --- */}
      <Card className={cn(
        "border-0 shadow-sm",
        isDark ? "bg-stone-900/50 border-stone-800" : "bg-white/50 border-stone-200"
      )}>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                <Input
                  placeholder="搜索组织、部门或成员..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "pl-10 font-serif transition-all duration-200",
                    "focus:ring-2 focus:ring-stone-500 focus:border-transparent",
                    isDark ? "bg-stone-800 border-stone-700 text-stone-100" : "bg-white border-stone-300"
                  )}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className={cn(
                  "w-full sm:w-32 font-serif",
                  isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"
                )}>
                  <SelectValue placeholder="角色" />
                </SelectTrigger>
                <SelectContent className={isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"}>
                  <SelectItem value="all" className="font-serif">全部角色</SelectItem>
                  <SelectItem value="owner" className="font-serif">所有者</SelectItem>
                  <SelectItem value="admin" className="font-serif">管理员</SelectItem>
                  <SelectItem value="member" className="font-serif">成员</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger className={cn(
                  "w-full sm:w-40 font-serif",
                  isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"
                )}>
                  <SelectValue placeholder="组织" />
                </SelectTrigger>
                <SelectContent className={isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"}>
                  <SelectItem value="all" className="font-serif">全部组织</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id} className="font-serif">
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className={cn(
                  "w-full sm:w-32 font-serif",
                  isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"
                )}>
                  <SelectValue placeholder="排序" />
                </SelectTrigger>
                <SelectContent className={isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"}>
                  <SelectItem value="name" className="font-serif">按名称</SelectItem>
                  <SelectItem value="members" className="font-serif">按成员数</SelectItem>
                  <SelectItem value="departments" className="font-serif">按部门数</SelectItem>
                  <SelectItem value="created" className="font-serif">按创建时间</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className={cn(
          "grid w-full grid-cols-4 p-1 rounded-lg",
          isDark ? "bg-stone-800/50 border-stone-700" : "bg-stone-100/50 border-stone-200"
        )}>
          <TabsTrigger 
            value="overview" 
            className={cn(
              "font-serif transition-all duration-200",
              "data-[state=active]:bg-white data-[state=active]:text-stone-900",
              "dark:data-[state=active]:bg-stone-700 dark:data-[state=active]:text-stone-100"
            )}
          >
            <Building2 className="w-4 h-4 mr-2" />
            组织概览
          </TabsTrigger>
          <TabsTrigger 
            value="organizations" 
            className={cn(
              "font-serif transition-all duration-200",
              "data-[state=active]:bg-white data-[state=active]:text-stone-900",
              "dark:data-[state=active]:bg-stone-700 dark:data-[state=active]:text-stone-100"
            )}
          >
            <Users className="w-4 h-4 mr-2" />
            组织列表
          </TabsTrigger>
          <TabsTrigger 
            value="departments" 
            className={cn(
              "font-serif transition-all duration-200",
              "data-[state=active]:bg-white data-[state=active]:text-stone-900",
              "dark:data-[state=active]:bg-stone-700 dark:data-[state=active]:text-stone-100"
            )}
          >
            <Layers className="w-4 h-4 mr-2" />
            部门管理
          </TabsTrigger>
          <TabsTrigger 
            value="permissions" 
            className={cn(
              "font-serif transition-all duration-200",
              "data-[state=active]:bg-white data-[state=active]:text-stone-900",
              "dark:data-[state=active]:bg-stone-700 dark:data-[state=active]:text-stone-100"
            )}
          >
            <Settings className="w-4 h-4 mr-2" />
            权限配置
          </TabsTrigger>
        </TabsList>

        {/* --- 组织概览标签页 --- */}
        <TabsContent value="overview" className="space-y-6">
          {/* 快速统计 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className={cn(
              "border-0 shadow-lg transition-all duration-200 hover:shadow-xl",
              isDark ? "bg-gradient-to-br from-stone-800 to-stone-900 border-stone-700" : "bg-gradient-to-br from-white to-stone-50"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-stone-700 dark:text-stone-300">
                  组织活跃度
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-serif text-stone-600 dark:text-stone-400">
                      有成员的组织
                    </span>
                    <Badge variant="secondary" className="font-serif">
                      {organizations.filter(org => 
                        orgMembers.some(m => m.org_id === org.id)
                      ).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-serif text-stone-600 dark:text-stone-400">
                      空组织
                    </span>
                    <Badge variant="outline" className="font-serif">
                      {organizations.filter(org => 
                        !orgMembers.some(m => m.org_id === org.id)
                      ).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "border-0 shadow-lg transition-all duration-200 hover:shadow-xl",
              isDark ? "bg-gradient-to-br from-stone-800 to-stone-900 border-stone-700" : "bg-gradient-to-br from-white to-stone-50"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-stone-700 dark:text-stone-300">
                  角色分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-serif text-stone-600 dark:text-stone-400">
                      所有者
                    </span>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-serif">
                        {orgMembers.filter(m => m.role === 'owner').length}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-serif text-stone-600 dark:text-stone-400">
                      管理员
                    </span>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-serif">
                        {orgMembers.filter(m => m.role === 'admin').length}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-serif text-stone-600 dark:text-stone-400">
                      成员
                    </span>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-green-500" />
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-serif">
                        {orgMembers.filter(m => m.role === 'member').length}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "border-0 shadow-lg transition-all duration-200 hover:shadow-xl",
              isDark ? "bg-gradient-to-br from-stone-800 to-stone-900 border-stone-700" : "bg-gradient-to-br from-white to-stone-50"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-stone-700 dark:text-stone-300">
                  热门部门
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orgStats?.topDepartments.slice(0, 3).map((dept, index) => (
                    <div key={dept.department} className="flex justify-between items-center">
                      <span className="text-sm font-serif text-stone-600 dark:text-stone-400 truncate">
                        {dept.department}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          index === 0 && "bg-amber-500",
                          index === 1 && "bg-stone-400",
                          index === 2 && "bg-amber-600"
                        )} />
                        <Badge variant="outline" className="font-serif text-xs">
                          {dept.count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!orgStats?.topDepartments.length) && (
                    <p className="text-sm text-stone-500 dark:text-stone-400 font-serif text-center py-4">
                      暂无部门数据
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "border-0 shadow-lg transition-all duration-200 hover:shadow-xl",
              isDark ? "bg-gradient-to-br from-stone-800 to-stone-900 border-stone-700" : "bg-gradient-to-br from-white to-stone-50"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-stone-700 dark:text-stone-300">
                  权限状态
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-serif text-stone-600 dark:text-stone-400">
                      已配置权限
                    </span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-serif">
                        {orgStats?.organizationsWithPermissions || 0}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-serif text-stone-600 dark:text-stone-400">
                      未配置权限
                    </span>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-serif">
                        {(orgStats?.totalOrganizations || 0) - (orgStats?.organizationsWithPermissions || 0)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 最近活动 */}
          <Card className={cn(
            "border-0 shadow-lg",
            isDark ? "bg-gradient-to-br from-stone-800 to-stone-900 border-stone-700" : "bg-gradient-to-br from-white to-stone-50"
          )}>
            <CardHeader>
              <CardTitle className="text-xl font-serif text-stone-700 dark:text-stone-300">
                最近创建的组织
              </CardTitle>
              <CardDescription className="font-serif text-stone-600 dark:text-stone-400">
                按创建时间排序的最新组织
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organizations
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 5)
                  .map((org) => {
                    const memberCount = orgMembers.filter(m => m.org_id === org.id).length
                    const deptCount = departmentInfo.filter(d => d.org_id === org.id).length
                    
                    return (
                      <div 
                        key={org.id} 
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                          isDark ? "bg-stone-800/50 border-stone-700 hover:border-stone-600" : "bg-white/50 border-stone-200 hover:border-stone-300"
                        )}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            isDark ? "bg-stone-700" : "bg-stone-100"
                          )}>
                            <Building2 className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                          </div>
                          <div>
                            <h4 className="font-medium font-serif text-stone-900 dark:text-stone-100">
                              {org.name}
                            </h4>
                            <p className="text-sm text-stone-600 dark:text-stone-400 font-serif">
                              {org.settings?.description || '暂无描述'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-stone-500" />
                              <span className="text-sm font-serif text-stone-600 dark:text-stone-400">
                                {memberCount} 成员
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Layers className="w-4 h-4 text-stone-500" />
                              <span className="text-sm font-serif text-stone-600 dark:text-stone-400">
                                {deptCount} 部门
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="font-serif">
                            {new Date(org.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                {organizations.length === 0 && (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                    <p className="text-stone-600 dark:text-stone-400 font-serif">
                      暂无组织数据
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 组织列表标签页 --- */}
        <TabsContent value="organizations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => {
              const orgMemberCount = orgMembers.filter(m => m.org_id === org.id).length
              const orgDepartments = departmentInfo.filter(d => d.org_id === org.id)
              
              return (
                <Card key={org.id} className={cn(
                  "border-0 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]",
                  isDark ? "bg-gradient-to-br from-stone-800 to-stone-900" : "bg-gradient-to-br from-white to-stone-50"
                )}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center",
                          isDark ? "bg-stone-700" : "bg-stone-100"
                        )}>
                          <Building2 className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                        </div>
                        <div>
                          <CardTitle className="font-serif text-lg text-stone-900 dark:text-stone-100">
                            {org.name}
                          </CardTitle>
                          <CardDescription className="font-serif text-stone-600 dark:text-stone-400">
                            {org.settings?.description || '暂无描述'}
                          </CardDescription>
                        </div>
                      </div>
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
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 统计信息 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={cn(
                        "p-3 rounded-lg border",
                        isDark ? "bg-stone-800/50 border-stone-700" : "bg-white/70 border-stone-200"
                      )}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-serif text-stone-600 dark:text-stone-400">成员</span>
                        </div>
                        <p className="text-xl font-bold font-serif text-green-700 dark:text-green-300 mt-1">
                          {orgMemberCount}
                        </p>
                      </div>
                      <div className={cn(
                        "p-3 rounded-lg border",
                        isDark ? "bg-stone-800/50 border-stone-700" : "bg-white/70 border-stone-200"
                      )}>
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-serif text-stone-600 dark:text-stone-400">部门</span>
                        </div>
                        <p className="text-xl font-bold font-serif text-purple-700 dark:text-purple-300 mt-1">
                          {orgDepartments.length}
                        </p>
                      </div>
                    </div>

                    {/* 部门列表 */}
                    {orgDepartments.length > 0 && (
                      <div>
                        <h4 className="font-medium font-serif text-stone-700 dark:text-stone-300 mb-2">
                          部门列表
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {orgDepartments.map((dept) => (
                            <div 
                              key={dept.department}
                              className={cn(
                                "flex items-center justify-between p-2 rounded border",
                                isDark ? "bg-stone-800/30 border-stone-700" : "bg-stone-50 border-stone-200"
                              )}
                            >
                              <span className="text-sm font-serif text-stone-700 dark:text-stone-300">
                                {dept.department}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant={dept.has_permissions ? "default" : "outline"} className="text-xs font-serif">
                                  {dept.has_permissions ? '已配权限' : '未配权限'}
                                </Badge>
                                <Badge variant="secondary" className="text-xs font-serif">
                                  {dept.member_count} 人
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 创建时间 */}
                    <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-serif text-stone-600 dark:text-stone-400">创建时间</span>
                        <span className="font-serif text-stone-700 dark:text-stone-300">
                          {new Date(org.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {filteredOrganizations.length === 0 && (
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
                    {searchTerm ? '没有找到匹配的组织' : '还没有创建任何组织'}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setIsCreateOrgOpen(true)}
                      className={cn(
                        "bg-stone-900 hover:bg-stone-800 text-white font-serif",
                        "dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900"
                      )}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      创建第一个组织
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* --- 部门管理标签页 --- */}
        <TabsContent value="departments" className="space-y-4">
          <div className="space-y-6">
            {filteredDepartments.map((dept) => {
              const deptMembers = orgMembers.filter(
                m => m.org_id === dept.org_id && m.department === dept.department
              )
              
              return (
                <Card key={`${dept.org_id}-${dept.department}`} className={cn(
                  "border-0 shadow-lg transition-all duration-200 hover:shadow-xl",
                  isDark ? "bg-gradient-to-br from-stone-800 to-stone-900" : "bg-gradient-to-br from-white to-stone-50"
                )}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center",
                          isDark ? "bg-stone-700" : "bg-stone-100"
                        )}>
                          <Layers className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                        </div>
                        <div>
                          <CardTitle className="font-serif text-lg text-stone-900 dark:text-stone-100">
                            {dept.org_name} - {dept.department}
                          </CardTitle>
                          <CardDescription className="font-serif text-stone-600 dark:text-stone-400">
                            {dept.member_count} 名成员 • 角色: {dept.roles}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={dept.has_permissions ? "default" : "outline"} 
                          className="font-serif"
                        >
                          {dept.has_permissions ? '已配权限' : '未配权限'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* 成员列表 */}
                    {deptMembers.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium font-serif text-stone-700 dark:text-stone-300">
                            部门成员
                          </h4>
                          <Badge variant="secondary" className="font-serif">
                            {deptMembers.length} 人
                          </Badge>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {deptMembers.map((member) => (
                            <div 
                              key={member.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border",
                                isDark ? "bg-stone-800/50 border-stone-700" : "bg-white/70 border-stone-200"
                              )}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-serif",
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
                                    {member.job_title || '暂无职位'} • {member.user?.email}
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
                                  className={cn(
                                    "text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300",
                                    "dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                                  )}
                                >
                                  <UserMinus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {deptMembers.length === 0 && (
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
          
          {filteredDepartments.length === 0 && (
            <Card className={cn(
              "border-0 shadow-lg",
              isDark ? "bg-stone-800/50" : "bg-white/50"
            )}>
              <CardContent className="py-12">
                <div className="text-center">
                  <Layers className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium font-serif text-stone-700 dark:text-stone-300 mb-2">
                    暂无部门
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 font-serif mb-4">
                    {searchTerm ? '没有找到匹配的部门' : '还没有创建任何部门'}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setIsAddUserOpen(true)}
                      className={cn(
                        "bg-stone-900 hover:bg-stone-800 text-white font-serif",
                        "dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-stone-900"
                      )}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      添加第一个成员
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* --- 权限配置标签页 --- */}
        <TabsContent value="permissions" className="space-y-4">
          <Card className={cn(
            "border-0 shadow-lg",
            isDark ? "bg-gradient-to-br from-stone-800 to-stone-900" : "bg-gradient-to-br from-white to-stone-50"
          )}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  isDark ? "bg-stone-700" : "bg-stone-100"
                )}>
                  <Settings className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-serif text-stone-900 dark:text-stone-100">
                    应用权限配置
                  </CardTitle>
                  <CardDescription className="font-serif text-stone-600 dark:text-stone-400">
                    管理组织和部门的应用访问权限
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AppPermissionsManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 