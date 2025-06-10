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
import { Switch } from '@components/ui/switch'
import { Settings, Shield, Users, Globe, Lock, Building2, Search, Filter, Edit, Plus, Minus } from 'lucide-react'
import { cn } from '@lib/utils'
import toast from 'react-hot-toast'

// --- BEGIN COMMENT ---
// 现代化权限管理界面 - 紧凑设计
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
  const { isDark } = useTheme()
  const [serviceInstances, setServiceInstances] = useState<ServiceInstance[]>([])
  const [departmentPermissions, setDepartmentPermissions] = useState<DepartmentPermission[]>([])
  const [orgDepartments, setOrgDepartments] = useState<OrgDepartment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<ServiceInstance | null>(null)
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  
  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')

  // 数据获取函数
  const fetchServiceInstances = async () => {
    try {
      const response = await fetch('/api/admin/app-permissions/instances')
      if (response.ok) {
        const data = await response.json()
        setServiceInstances(data.instances || [])
      }
    } catch (error) {
      toast.error('获取应用实例失败')
      console.error('获取应用实例失败:', error)
    }
  }

  const fetchDepartmentPermissions = async () => {
    try {
      const response = await fetch('/api/admin/app-permissions/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartmentPermissions(data.permissions || [])
      }
    } catch (error) {
      toast.error('获取部门权限失败')
      console.error('获取部门权限失败:', error)
    }
  }

  const fetchOrgDepartments = async () => {
    try {
      const response = await fetch('/api/admin/organizations/departments')
      if (response.ok) {
        const data = await response.json()
        setOrgDepartments(data.departments || [])
      }
    } catch (error) {
      toast.error('获取组织部门失败')
      console.error('获取组织部门失败:', error)
    }
  }

  const updateAppVisibility = async (appId: string, visibility: string) => {
    try {
      const response = await fetch('/api/admin/app-permissions/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, visibility }),
      })

      if (response.ok) {
        await fetchServiceInstances()
        toast.success('应用可见性更新成功')
      } else {
        toast.error('更新失败')
      }
    } catch (error) {
      toast.error('更新应用可见性失败')
      console.error('更新应用可见性失败:', error)
    }
  }

  const updateDepartmentPermission = async (
    orgId: string,
    department: string,
    appId: string,
    permission: { is_enabled: boolean; usage_quota?: number }
  ) => {
    try {
      const response = await fetch('/api/admin/app-permissions/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, department, appId, ...permission }),
      })

      if (response.ok) {
        await fetchDepartmentPermissions()
        toast.success('部门权限更新成功')
      } else {
        toast.error('更新失败')
      }
    } catch (error) {
      toast.error('更新部门权限失败')
      console.error('更新部门权限失败:', error)
    }
  }

  // 工具函数
  const getAppDepartmentPermissions = (appId: string) => {
    return departmentPermissions.filter(p => p.service_instance_id === appId)
  }

  const getVisibilityConfig = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return {
          icon: <Globe className="w-3 h-3" />,
          label: '公开',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }
      case 'org_only':
        return {
          icon: <Building2 className="w-3 h-3" />,
          label: '组织',
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
        }
      case 'private':
        return {
          icon: <Lock className="w-3 h-3" />,
          label: '私有',
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }
      default:
        return {
          icon: <Shield className="w-3 h-3" />,
          label: '未知',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }
  }

  // 筛选后的应用列表
  const filteredApps = serviceInstances.filter(app => {
    const matchesSearch = app.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.instance_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesVisibility = visibilityFilter === 'all' || app.visibility === visibilityFilter
    return matchesSearch && matchesVisibility
  })

  // 初始化数据
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
        <div className="text-stone-600 dark:text-stone-400 font-serif">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索和筛选栏 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
            <Input
              placeholder="搜索应用名称或ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "pl-10 font-serif",
                isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"
              )}
            />
          </div>
        </div>
        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger className={cn(
            "w-32 font-serif",
            isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"
          )}>
            <SelectValue placeholder="可见性" />
          </SelectTrigger>
          <SelectContent className={isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-200"}>
            <SelectItem value="all" className="font-serif">全部</SelectItem>
            <SelectItem value="public" className="font-serif">公开</SelectItem>
            <SelectItem value="org_only" className="font-serif">组织</SelectItem>
            <SelectItem value="private" className="font-serif">私有</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className={cn(
          "border-0 shadow-sm",
          isDark ? "bg-stone-800/50" : "bg-white/50"
        )}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs font-serif text-stone-600 dark:text-stone-400">总应用</p>
                <p className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                  {serviceInstances.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-0 shadow-sm",
          isDark ? "bg-stone-800/50" : "bg-white/50"
        )}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs font-serif text-stone-600 dark:text-stone-400">公开</p>
                <p className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                  {serviceInstances.filter(app => app.visibility === 'public').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-0 shadow-sm",
          isDark ? "bg-stone-800/50" : "bg-white/50"
        )}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-xs font-serif text-stone-600 dark:text-stone-400">组织</p>
                <p className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                  {serviceInstances.filter(app => app.visibility === 'org_only').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-0 shadow-sm",
          isDark ? "bg-stone-800/50" : "bg-white/50"
        )}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-xs font-serif text-stone-600 dark:text-stone-400">权限配置</p>
                <p className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                  {departmentPermissions.filter(p => p.is_enabled).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 应用列表表格 */}
      <Card className={cn(
        "border-0 shadow-sm",
        isDark ? "bg-stone-800/30" : "bg-white/70"
      )}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={cn(
                  "border-b",
                  isDark ? "border-stone-700" : "border-stone-200"
                )}>
                  <th className="text-left p-4 font-serif text-sm font-medium text-stone-700 dark:text-stone-300">
                    应用信息
                  </th>
                  <th className="text-left p-4 font-serif text-sm font-medium text-stone-700 dark:text-stone-300">
                    可见性
                  </th>
                  <th className="text-left p-4 font-serif text-sm font-medium text-stone-700 dark:text-stone-300">
                    部门权限
                  </th>
                  <th className="text-right p-4 font-serif text-sm font-medium text-stone-700 dark:text-stone-300">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const appPermissions = getAppDepartmentPermissions(app.id)
                  const authorizedDepts = appPermissions.filter(p => p.is_enabled).length
                  const visibilityConfig = getVisibilityConfig(app.visibility)
                  
                  return (
                    <tr 
                      key={app.id}
                      className={cn(
                        "border-b transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-700/30",
                        isDark ? "border-stone-700" : "border-stone-200"
                      )}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium font-serif text-stone-900 dark:text-stone-100">
                            {app.display_name}
                          </p>
                          <p className="text-sm text-stone-600 dark:text-stone-400 font-serif">
                            ID: {app.instance_id}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Select
                          value={app.visibility}
                          onValueChange={(value) => updateAppVisibility(app.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <div className="flex items-center gap-1">
                              {visibilityConfig.icon}
                              <span className="font-serif">{visibilityConfig.label}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public" className="font-serif">
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 text-green-600" />
                                <span>公开</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="org_only" className="font-serif">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-3 h-3 text-amber-600" />
                                <span>组织限定</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="private" className="font-serif">
                              <div className="flex items-center gap-2">
                                <Lock className="w-3 h-3 text-red-600" />
                                <span>私有</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        {app.visibility === 'org_only' ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs font-serif">
                              {authorizedDepts} 个部门
                            </Badge>
                            {authorizedDepts > 0 && (
                              <Badge variant="outline" className="text-xs font-serif">
                                已配置
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-stone-500 dark:text-stone-400 font-serif">
                            {app.visibility === 'public' ? '全员可见' : '仅管理员'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {app.visibility === 'org_only' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApp(app)
                              setIsPermissionDialogOpen(true)
                            }}
                            className="h-8 text-xs font-serif"
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            配置
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {filteredApps.length === 0 && (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-stone-400 mx-auto mb-3" />
              <p className="text-stone-600 dark:text-stone-400 font-serif">
                {searchTerm ? '没有找到匹配的应用' : '暂无应用数据'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 权限配置对话框 */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className={cn(
          "max-w-2xl max-h-[80vh] overflow-y-auto",
          isDark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"
        )}>
          <DialogHeader>
            <DialogTitle className="font-serif text-stone-900 dark:text-stone-100">
              配置应用权限 - {selectedApp?.display_name}
            </DialogTitle>
            <DialogDescription className="font-serif text-stone-600 dark:text-stone-400">
              为组织部门配置对此应用的访问权限和使用配额
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {orgDepartments.map((dept) => {
              const existingPermission = departmentPermissions.find(
                p => p.org_id === dept.org_id && 
                     p.department === dept.department && 
                     p.service_instance_id === selectedApp?.id
              )
              
              return (
                <div 
                  key={`${dept.org_id}-${dept.department}`}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    isDark ? "bg-stone-800/50 border-stone-700" : "bg-stone-50 border-stone-200"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isDark ? "bg-stone-700" : "bg-stone-100"
                    )}>
                      <Building2 className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                    </div>
                    <div>
                      <p className="font-medium font-serif text-stone-900 dark:text-stone-100">
                        {dept.org_name}
                      </p>
                      <p className="text-sm text-stone-600 dark:text-stone-400 font-serif">
                        {dept.department} • {dept.member_count} 成员
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* 使用配额设置 */}
                    {existingPermission?.is_enabled && (
                      <div className="flex items-center space-x-2">
                        <Label className="text-xs font-serif text-stone-600 dark:text-stone-400">
                          月配额:
                        </Label>
                        <Input
                          type="number"
                          placeholder="无限制"
                          value={existingPermission.usage_quota || ''}
                          onChange={(e) => {
                            const quota = e.target.value ? parseInt(e.target.value) : undefined
                            updateDepartmentPermission(
                              dept.org_id,
                              dept.department,
                              selectedApp!.id,
                              {
                                is_enabled: true,
                                usage_quota: quota
                              }
                            )
                          }}
                          className={cn(
                            "w-20 h-8 text-xs font-serif",
                            isDark ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"
                          )}
                        />
                        {existingPermission.usage_quota && (
                          <Badge variant="outline" className="text-xs font-serif">
                            {existingPermission.used_count}/{existingPermission.usage_quota}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* 启用/禁用开关 */}
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs font-serif text-stone-600 dark:text-stone-400">
                        启用
                      </Label>
                      <Switch
                        checked={existingPermission?.is_enabled || false}
                        onCheckedChange={(checked) => {
                          updateDepartmentPermission(
                            dept.org_id,
                            dept.department,
                            selectedApp!.id,
                            {
                              is_enabled: checked,
                              usage_quota: existingPermission?.usage_quota
                            }
                          )
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            
            {orgDepartments.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-600 dark:text-stone-400 font-serif">
                  暂无组织部门数据
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPermissionDialogOpen(false)}
              className="font-serif"
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 