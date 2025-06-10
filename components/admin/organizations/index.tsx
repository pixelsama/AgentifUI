'use client'

import { useState, useEffect } from 'react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { Textarea } from '@components/ui/textarea'
import { Plus, Users, Building2, UserPlus, Settings } from 'lucide-react'
import { cn } from '@lib/utils'

// --- BEGIN COMMENT ---
// 组织管理相关类型定义
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

export default function OrganizationsManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([])
  const [departmentInfo, setDepartmentInfo] = useState<OrgDepartmentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrg, setSelectedOrg] = useState<string>('')
  
  // --- BEGIN COMMENT ---
  // 新建组织表单状态
  // --- END COMMENT ---
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    description: ''
  })
  
  // --- BEGIN COMMENT ---
  // 添加用户到组织表单状态
  // --- END COMMENT ---
  const [addUserForm, setAddUserForm] = useState({
    userId: '',
    orgId: '',
    department: '',
    jobTitle: '',
    role: 'member' as 'owner' | 'admin' | 'member'
  })

  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)

  // --- BEGIN COMMENT ---
  // 获取组织列表
  // --- END COMMENT ---
  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/admin/organizations')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations || [])
      }
    } catch (error) {
      console.error('获取组织列表失败:', error)
    }
  }

  // --- BEGIN COMMENT ---
  // 获取组织成员信息
  // --- END COMMENT ---
  const fetchOrgMembers = async () => {
    try {
      const response = await fetch('/api/admin/organizations/members')
      if (response.ok) {
        const data = await response.json()
        setOrgMembers(data.members || [])
      }
    } catch (error) {
      console.error('获取组织成员失败:', error)
    }
  }

  // --- BEGIN COMMENT ---
  // 获取部门信息
  // --- END COMMENT ---
  const fetchDepartmentInfo = async () => {
    try {
      const response = await fetch('/api/admin/organizations/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartmentInfo(data.departments || [])
      }
    } catch (error) {
      console.error('获取部门信息失败:', error)
    }
  }

  // --- BEGIN COMMENT ---
  // 创建新组织
  // --- END COMMENT ---
  const handleCreateOrganization = async () => {
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newOrgForm.name,
          settings: {
            description: newOrgForm.description
          }
        }),
      })

      if (response.ok) {
        setIsCreateOrgOpen(false)
        setNewOrgForm({ name: '', description: '' })
        await fetchOrganizations()
      }
    } catch (error) {
      console.error('创建组织失败:', error)
    }
  }

  // --- BEGIN COMMENT ---
  // 添加用户到组织
  // --- END COMMENT ---
  const handleAddUserToOrg = async () => {
    try {
      const response = await fetch('/api/admin/organizations/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      }
    } catch (error) {
      console.error('添加用户到组织失败:', error)
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-stone-600 font-serif">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* --- 页面标题 --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif">组织管理</h1>
          <p className="text-stone-600 font-serif">管理组织结构、部门和成员关系</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isCreateOrgOpen} onOpenChange={setIsCreateOrgOpen}>
            <DialogTrigger asChild>
              <Button className="bg-stone-600 hover:bg-stone-700 text-white font-serif">
                <Building2 className="w-4 h-4 mr-2" />
                创建组织
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">创建新组织</DialogTitle>
                <DialogDescription className="font-serif">
                  创建一个新的组织，可以包含多个部门和成员
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="org-name" className="font-serif">组织名称</Label>
                  <Input
                    id="org-name"
                    value={newOrgForm.name}
                    onChange={(e) => setNewOrgForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入组织名称"
                    className="font-serif"
                  />
                </div>
                <div>
                  <Label htmlFor="org-description" className="font-serif">组织描述</Label>
                  <Textarea
                    id="org-description"
                    value={newOrgForm.description}
                    onChange={(e) => setNewOrgForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入组织描述（可选）"
                    className="font-serif"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateOrganization}
                  disabled={!newOrgForm.name.trim()}
                  className="bg-stone-600 hover:bg-stone-700 font-serif"
                >
                  创建组织
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 font-serif">
                <UserPlus className="w-4 h-4 mr-2" />
                添加成员
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">添加用户到组织</DialogTitle>
                <DialogDescription className="font-serif">
                  将用户添加到指定组织和部门
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-id" className="font-serif">用户ID</Label>
                  <Input
                    id="user-id"
                    value={addUserForm.userId}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="输入用户ID"
                    className="font-serif"
                  />
                </div>
                <div>
                  <Label htmlFor="org-select" className="font-serif">选择组织</Label>
                  <Select
                    value={addUserForm.orgId}
                    onValueChange={(value) => setAddUserForm(prev => ({ ...prev, orgId: value }))}
                  >
                    <SelectTrigger className="font-serif">
                      <SelectValue placeholder="选择组织" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id} className="font-serif">
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department" className="font-serif">部门</Label>
                  <Input
                    id="department"
                    value={addUserForm.department}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="输入部门名称"
                    className="font-serif"
                  />
                </div>
                <div>
                  <Label htmlFor="job-title" className="font-serif">职位</Label>
                  <Input
                    id="job-title"
                    value={addUserForm.jobTitle}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="输入职位名称（可选）"
                    className="font-serif"
                  />
                </div>
                <div>
                  <Label htmlFor="role-select" className="font-serif">角色</Label>
                  <Select
                    value={addUserForm.role}
                    onValueChange={(value: 'owner' | 'admin' | 'member') => 
                      setAddUserForm(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger className="font-serif">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  className="bg-stone-600 hover:bg-stone-700 font-serif"
                >
                  添加成员
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="font-serif">概览</TabsTrigger>
          <TabsTrigger value="organizations" className="font-serif">组织列表</TabsTrigger>
          <TabsTrigger value="departments" className="font-serif">部门管理</TabsTrigger>
        </TabsList>

        {/* --- 概览标签页 --- */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-serif">总组织数</CardTitle>
                <Building2 className="h-4 w-4 text-stone-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{organizations.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-serif">总成员数</CardTitle>
                <Users className="h-4 w-4 text-stone-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{orgMembers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-serif">部门数</CardTitle>
                <Settings className="h-4 w-4 text-stone-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{departmentInfo.length}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- 组织列表标签页 --- */}
        <TabsContent value="organizations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => {
              const orgMemberCount = orgMembers.filter(m => m.org_id === org.id).length
              const orgDepartments = departmentInfo.filter(d => d.org_id === org.id)
              
              return (
                <Card key={org.id}>
                  <CardHeader>
                    <CardTitle className="font-serif">{org.name}</CardTitle>
                    <CardDescription className="font-serif">
                      {org.settings?.description || '暂无描述'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-serif">
                        <span className="text-stone-600">成员数量:</span>
                        <span className="font-medium">{orgMemberCount}</span>
                      </div>
                      <div className="flex justify-between text-sm font-serif">
                        <span className="text-stone-600">部门数量:</span>
                        <span className="font-medium">{orgDepartments.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {orgDepartments.map((dept) => (
                          <Badge key={dept.department} variant="secondary" className="text-xs font-serif">
                            {dept.department}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* --- 部门管理标签页 --- */}
        <TabsContent value="departments" className="space-y-4">
          <div className="space-y-4">
            {departmentInfo.map((dept) => (
              <Card key={`${dept.org_id}-${dept.department}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-serif">{dept.org_name} - {dept.department}</CardTitle>
                      <CardDescription className="font-serif">
                        {dept.member_count} 名成员 • 角色: {dept.roles}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={dept.has_permissions ? "default" : "secondary"}
                      className="font-serif"
                    >
                      {dept.has_permissions ? '已配置权限' : '未配置权限'}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 