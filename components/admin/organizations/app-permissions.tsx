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
import { Switch } from '@components/ui/switch'
import { Settings, Shield, Users, Globe, Lock, Building2 } from 'lucide-react'
import { cn } from '@lib/utils'

// --- BEGIN COMMENT ---
// 应用权限管理相关类型定义
// --- END COMMENT ---
interface ServiceInstance {
  id: string
  display_name: string
  description?: string
  instance_id: string
  api_path: string
  visibility: 'public' | 'org_only' | 'private'
  config: any
  created_at: string
  updated_at: string
}

interface DepartmentPermission {
  id: string
  org_id: string
  department: string
  service_instance_id: string
  is_enabled: boolean
  permission_level: 'full' | 'read_only' | 'restricted'
  usage_quota?: number
  used_count: number
  org_name: string
}

interface OrgDepartment {
  org_id: string
  org_name: string
  department: string
  member_count: number
}

export default function AppPermissionsManagement() {
  const [serviceInstances, setServiceInstances] = useState<ServiceInstance[]>([])
  const [departmentPermissions, setDepartmentPermissions] = useState<DepartmentPermission[]>([])
  const [orgDepartments, setOrgDepartments] = useState<OrgDepartment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<ServiceInstance | null>(null)
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)

  // --- BEGIN COMMENT ---
  // 获取所有应用实例
  // --- END COMMENT ---
  const fetchServiceInstances = async () => {
    try {
      const response = await fetch('/api/admin/app-permissions/instances')
      if (response.ok) {
        const data = await response.json()
        setServiceInstances(data.instances || [])
      }
    } catch (error) {
      console.error('获取应用实例失败:', error)
    }
  }

  // --- BEGIN COMMENT ---
  // 获取部门权限配置
  // --- END COMMENT ---
  const fetchDepartmentPermissions = async () => {
    try {
      const response = await fetch('/api/admin/app-permissions/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartmentPermissions(data.permissions || [])
      }
    } catch (error) {
      console.error('获取部门权限失败:', error)
    }
  }

  // --- BEGIN COMMENT ---
  // 获取组织部门信息
  // --- END COMMENT ---
  const fetchOrgDepartments = async () => {
    try {
      const response = await fetch('/api/admin/organizations/departments')
      if (response.ok) {
        const data = await response.json()
        setOrgDepartments(data.departments || [])
      }
    } catch (error) {
      console.error('获取组织部门失败:', error)
    }
  }

  // --- BEGIN COMMENT ---
  // 更新应用可见性
  // --- END COMMENT ---
  const updateAppVisibility = async (appId: string, visibility: string) => {
    try {
      const response = await fetch('/api/admin/app-permissions/visibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId,
          visibility
        }),
      })

      if (response.ok) {
        await fetchServiceInstances()
      }
    } catch (error) {
      console.error('更新应用可见性失败:', error)
    }
  }

  // --- BEGIN COMMENT ---
  // 更新部门权限
  // --- END COMMENT ---
  const updateDepartmentPermission = async (
    orgId: string,
    department: string,
    appId: string,
    permission: {
      is_enabled: boolean
      permission_level: string
      usage_quota?: number
    }
  ) => {
    try {
      const response = await fetch('/api/admin/app-permissions/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId,
          department,
          appId,
          ...permission
        }),
      })

      if (response.ok) {
        await fetchDepartmentPermissions()
      }
    } catch (error) {
      console.error('更新部门权限失败:', error)
    }
  }

  // --- BEGIN COMMENT ---
  // 获取应用的部门权限
  // --- END COMMENT ---
  const getAppDepartmentPermissions = (appId: string) => {
    return departmentPermissions.filter(p => p.service_instance_id === appId)
  }

  // --- BEGIN COMMENT ---
  // 获取可见性图标
  // --- END COMMENT ---
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-600" />
      case 'org_only':
        return <Building2 className="w-4 h-4 text-amber-600" />
      case 'private':
        return <Lock className="w-4 h-4 text-red-600" />
      default:
        return <Shield className="w-4 h-4 text-stone-600" />
    }
  }

  // --- BEGIN COMMENT ---
  // 获取可见性标签
  // --- END COMMENT ---
  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return '公开'
      case 'org_only':
        return '组织限定'
      case 'private':
        return '私有'
      default:
        return '未知'
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchServiceInstances(),
        fetchDepartmentPermissions(),
        fetchOrgDepartments()
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
          <h1 className="text-2xl font-bold text-stone-900 font-serif">应用权限管理</h1>
          <p className="text-stone-600 font-serif">配置应用可见性和部门访问权限</p>
        </div>
      </div>

      <Tabs defaultValue="apps" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="apps" className="font-serif">应用配置</TabsTrigger>
          <TabsTrigger value="permissions" className="font-serif">权限概览</TabsTrigger>
        </TabsList>

        {/* --- 应用配置标签页 --- */}
        <TabsContent value="apps" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {serviceInstances.map((app) => {
              const appPermissions = getAppDepartmentPermissions(app.id)
              const authorizedDepts = appPermissions.filter(p => p.is_enabled).length
              
              return (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getVisibilityIcon(app.visibility)}
                        <div>
                          <CardTitle className="font-serif">{app.display_name}</CardTitle>
                          <CardDescription className="font-serif">
                            {app.description || '暂无描述'} • ID: {app.instance_id}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-serif">
                          {getVisibilityLabel(app.visibility)}
                        </Badge>
                        {app.visibility === 'org_only' && (
                          <Badge variant="secondary" className="font-serif">
                            {authorizedDepts} 个部门已授权
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* --- 可见性设置 --- */}
                      <div className="flex items-center justify-between">
                        <Label className="font-serif">应用可见性</Label>
                        <Select
                          value={app.visibility}
                          onValueChange={(value) => updateAppVisibility(app.id, value)}
                        >
                          <SelectTrigger className="w-40 font-serif">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public" className="font-serif">
                              <div className="flex items-center space-x-2">
                                <Globe className="w-4 h-4 text-green-600" />
                                <span>公开</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="org_only" className="font-serif">
                              <div className="flex items-center space-x-2">
                                <Building2 className="w-4 h-4 text-amber-600" />
                                <span>组织限定</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="private" className="font-serif">
                              <div className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-red-600" />
                                <span>私有</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* --- 部门权限配置（仅组织限定应用显示） --- */}
                      {app.visibility === 'org_only' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="font-serif">部门访问权限</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApp(app)
                                setIsPermissionDialogOpen(true)
                              }}
                              className="font-serif"
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              配置权限
                            </Button>
                          </div>
                          
                          {/* --- 已授权部门列表 --- */}
                          {appPermissions.length > 0 && (
                            <div className="space-y-2">
                              {appPermissions.filter(p => p.is_enabled).map((perm) => (
                                <div key={`${perm.org_id}-${perm.department}`} 
                                     className="flex items-center justify-between p-2 bg-stone-50 rounded">
                                  <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-stone-600" />
                                    <span className="font-serif text-sm">
                                      {perm.org_name} - {perm.department}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs font-serif">
                                      {perm.permission_level === 'full' ? '完全访问' : 
                                       perm.permission_level === 'read_only' ? '只读' : '受限'}
                                    </Badge>
                                    {perm.usage_quota && (
                                      <Badge variant="secondary" className="text-xs font-serif">
                                        {perm.used_count}/{perm.usage_quota}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* --- 权限概览标签页 --- */}
        <TabsContent value="permissions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-serif">总应用数</CardTitle>
                <Shield className="h-4 w-4 text-stone-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">{serviceInstances.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-serif">组织限定应用</CardTitle>
                <Building2 className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">
                  {serviceInstances.filter(app => app.visibility === 'org_only').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-serif">权限配置数</CardTitle>
                <Users className="h-4 w-4 text-stone-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-serif">
                  {departmentPermissions.filter(p => p.is_enabled).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- 部门权限详情 --- */}
          <div className="space-y-4">
            {orgDepartments.map((dept) => {
              const deptPermissions = departmentPermissions.filter(
                p => p.org_id === dept.org_id && p.department === dept.department && p.is_enabled
              )
              
              return (
                <Card key={`${dept.org_id}-${dept.department}`}>
                  <CardHeader>
                    <CardTitle className="font-serif">{dept.org_name} - {dept.department}</CardTitle>
                    <CardDescription className="font-serif">
                      {dept.member_count} 名成员 • {deptPermissions.length} 个应用权限
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {deptPermissions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {deptPermissions.map((perm) => {
                          const app = serviceInstances.find(a => a.id === perm.service_instance_id)
                          return (
                            <div key={perm.id} className="flex items-center justify-between p-2 bg-stone-50 rounded">
                              <span className="font-serif text-sm">{app?.display_name}</span>
                              <Badge variant="outline" className="text-xs font-serif">
                                {perm.permission_level === 'full' ? '完全' : 
                                 perm.permission_level === 'read_only' ? '只读' : '受限'}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-stone-500 font-serif text-sm">暂无应用权限</div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* --- 权限配置对话框 --- */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-serif">
              配置应用权限 - {selectedApp?.display_name}
            </DialogTitle>
            <DialogDescription className="font-serif">
              为不同部门配置此应用的访问权限和使用配额
            </DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {orgDepartments.map((dept) => {
                const existingPerm = departmentPermissions.find(
                  p => p.org_id === dept.org_id && 
                       p.department === dept.department && 
                       p.service_instance_id === selectedApp.id
                )
                
                return (
                  <div key={`${dept.org_id}-${dept.department}`} 
                       className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="font-medium font-serif">{dept.org_name} - {dept.department}</div>
                      <div className="text-sm text-stone-600 font-serif">{dept.member_count} 名成员</div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label className="font-serif text-sm">启用</Label>
                        <Switch
                          checked={existingPerm?.is_enabled || false}
                          onCheckedChange={(checked: boolean) => {
                            updateDepartmentPermission(
                              dept.org_id,
                              dept.department,
                              selectedApp.id,
                              {
                                is_enabled: checked,
                                permission_level: existingPerm?.permission_level || 'full'
                              }
                            )
                          }}
                        />
                      </div>
                      
                      {existingPerm?.is_enabled && (
                        <>
                          <Select
                            value={existingPerm.permission_level}
                            onValueChange={(value) => {
                              updateDepartmentPermission(
                                dept.org_id,
                                dept.department,
                                selectedApp.id,
                                {
                                  is_enabled: true,
                                  permission_level: value
                                }
                              )
                            }}
                          >
                            <SelectTrigger className="w-24 font-serif">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full" className="font-serif">完全</SelectItem>
                              <SelectItem value="read_only" className="font-serif">只读</SelectItem>
                              <SelectItem value="restricted" className="font-serif">受限</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <div className="flex items-center space-x-2">
                            <Label className="font-serif text-sm">配额</Label>
                            <Input
                              type="number"
                              placeholder="无限制"
                              value={existingPerm.usage_quota || ''}
                              onChange={(e) => {
                                const quota = e.target.value ? parseInt(e.target.value) : undefined
                                updateDepartmentPermission(
                                  dept.org_id,
                                  dept.department,
                                  selectedApp.id,
                                  {
                                    is_enabled: true,
                                    permission_level: existingPerm.permission_level,
                                    usage_quota: quota
                                  }
                                )
                              }}
                              className="w-20 font-serif"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          <DialogFooter>
            <Button
              onClick={() => setIsPermissionDialogOpen(false)}
              className="font-serif"
            >
              完成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 