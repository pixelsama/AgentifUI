"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTheme } from '@lib/hooks/use-theme'
import { cn } from '@lib/utils'

// --- BEGIN COMMENT ---
// 导入所有原子化组件
// --- END COMMENT ---
import { ContentTabs } from '@components/admin/content/content-tabs'
import { AboutEditor, AboutPageConfig } from '@components/admin/content/about-editor'
import { NotificationEditor, NotificationConfig } from '@components/admin/content/notification-editor'
import { AboutPreview } from '@components/admin/content/about-preview'
import { NotificationPreview } from '@components/admin/content/notification-preview'
import { PreviewToolbar } from '@components/admin/content/preview-toolbar'
import { SaveActions } from '@components/admin/content/save-actions'

export default function ContentManagementPage() {
  const { isDark } = useTheme()
  const searchParams = useSearchParams()
  const router = useRouter()

  // --- BEGIN COMMENT ---
  // 页面状态管理
  // --- END COMMENT ---
  const [activeTab, setActiveTab] = useState<'about' | 'notifications'>('about')
  const [showPreview, setShowPreview] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // --- BEGIN COMMENT ---
  // About页面初始配置
  // --- END COMMENT ---
  const initialAboutConfig: AboutPageConfig = {
    title: '关于 AgentifUI',
    subtitle: '我们致力于通过创新的AI技术，为用户提供更智能、更高效的交互体验，让每个人都能轻松享受人工智能带来的便利。',
    mission: '我们的使命是打造最直观、最强大的AI交互平台，让复杂的AI技术变得简单易用，让每个用户都能在数字化时代中获得更好的体验和价值。',
    valueCards: [
      {
        id: '1',
        title: '用户至上',
        description: '我们始终将用户需求放在首位，持续优化产品体验，确保每一个功能都能为用户创造真正的价值。'
      },
      {
        id: '2',
        title: '技术创新',
        description: '我们拥抱最新的AI技术，不断探索和实践，为用户带来更智能、更便捷的解决方案。'
      },
      {
        id: '3',
        title: '开放合作',
        description: '我们相信开放的力量，致力于构建一个包容性的平台，让更多的开发者和用户共同参与创新。'
      }
    ],
    buttonText: '立即体验',
    copyrightText: '© 2024 AgentifUI. 保留所有权利。'
  }

  // --- BEGIN COMMENT ---
  // 通知初始配置
  // --- END COMMENT ---
  const initialNotifications: NotificationConfig[] = [
    {
      id: '1',
      title: '欢迎使用 AgentifUI',
      content: '感谢您选择 AgentifUI！我们为您准备了丰富的功能，快来探索吧。',
      type: 'announcement',
      priority: 'medium',
      position: 'center',
      isActive: true,
      startDate: '2024-01-01',
      endDate: null,
      targetAudience: 'new_users'
    },
    {
      id: '2',
      title: '系统更新通知',
      content: '我们即将在今晚进行系统维护，预计停机时间为2小时，感谢您的耐心等待。',
      type: 'maintenance',
      priority: 'high',
      position: 'top-center',
      isActive: false,
      startDate: '2024-01-15',
      endDate: '2024-01-16',
      targetAudience: 'all'
    }
  ]

  // --- BEGIN COMMENT ---
  // About配置状态
  // --- END COMMENT ---
  const [aboutConfig, setAboutConfig] = useState<AboutPageConfig>(initialAboutConfig)
  const [originalAboutConfig, setOriginalAboutConfig] = useState<AboutPageConfig>(initialAboutConfig)

  // --- BEGIN COMMENT ---
  // 通知配置状态
  // --- END COMMENT ---
  const [notifications, setNotifications] = useState<NotificationConfig[]>(initialNotifications)
  const [originalNotifications, setOriginalNotifications] = useState<NotificationConfig[]>(initialNotifications)
  const [selectedNotification, setSelectedNotification] = useState<NotificationConfig | null>(initialNotifications[0] || null)

  // --- BEGIN COMMENT ---
  // URL参数同步 - 根据查询参数设置活动标签
  // --- END COMMENT ---
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'about' || tab === 'notifications') {
      setActiveTab(tab)
    }
  }, [searchParams])

  // --- BEGIN COMMENT ---
  // 变更检测 - 监听配置变化，更新hasChanges状态
  // --- END COMMENT ---
  useEffect(() => {
    const aboutChanged = JSON.stringify(aboutConfig) !== JSON.stringify(originalAboutConfig)
    const notificationsChanged = JSON.stringify(notifications) !== JSON.stringify(originalNotifications)
    setHasChanges(aboutChanged || notificationsChanged)
  }, [aboutConfig, notifications, originalAboutConfig, originalNotifications])

  // --- BEGIN COMMENT ---
  // 标签切换处理函数
  // --- END COMMENT ---
  const handleTabChange = (tab: 'about' | 'notifications') => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // --- BEGIN COMMENT ---
  // 保存配置到后端 (模拟API调用)
  // --- END COMMENT ---
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // --- BEGIN COMMENT ---
      // 这里应该调用实际的API保存数据
      // 目前使用模拟延迟
      // --- END COMMENT ---
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // --- BEGIN COMMENT ---
      // 保存成功后更新原始配置，重置hasChanges状态
      // --- END COMMENT ---
      setOriginalAboutConfig({ ...aboutConfig })
      setOriginalNotifications([...notifications])
      
      console.log('配置保存成功:', { 
        about: aboutConfig, 
        notifications: notifications 
      })
      
      // --- BEGIN COMMENT ---
      // 这里可以添加成功提示
      // --- END COMMENT ---
      
    } catch (error) {
      console.error('保存配置失败:', error)
      // --- BEGIN COMMENT ---
      // 这里可以添加错误提示
      // --- END COMMENT ---
    } finally {
      setIsSaving(false)
    }
  }

  // --- BEGIN COMMENT ---
  // 重置所有更改到原始状态
  // --- END COMMENT ---
  const handleReset = () => {
    setAboutConfig({ ...originalAboutConfig })
    setNotifications([...originalNotifications])
    setSelectedNotification(originalNotifications[0] || null)
  }

  // --- BEGIN COMMENT ---
  // 处理About配置变更
  // --- END COMMENT ---
  const handleAboutConfigChange = (newConfig: AboutPageConfig) => {
    setAboutConfig(newConfig)
  }

  // --- BEGIN COMMENT ---
  // 处理通知列表变更
  // --- END COMMENT ---
  const handleNotificationsChange = (newNotifications: NotificationConfig[]) => {
    setNotifications(newNotifications)
    
    // --- BEGIN COMMENT ---
    // 如果当前选中的通知被删除，清空选择
    // --- END COMMENT ---
    if (selectedNotification && !newNotifications.find(n => n.id === selectedNotification.id)) {
      setSelectedNotification(newNotifications[0] || null)
    }
  }

  // --- BEGIN COMMENT ---
  // 处理通知选择变更
  // --- END COMMENT ---
  const handleSelectedNotificationChange = (notification: NotificationConfig | null) => {
    setSelectedNotification(notification)
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      isDark ? "bg-stone-900" : "bg-stone-50"
    )}>
      {/* --- BEGIN COMMENT ---
      页面头部区域 - 标题和描述
      --- END COMMENT --- */}
      <div className={cn(
        "border-b",
        isDark ? "bg-stone-800 border-stone-600" : "bg-white border-stone-200"
      )}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className={cn(
            "text-2xl font-bold",
            isDark ? "text-stone-100" : "text-stone-900"
          )}>
            关于与通知管理
          </h1>
          <p className={cn(
            "mt-2 text-sm",
            isDark ? "text-stone-400" : "text-stone-600"
          )}>
            管理About页面内容和系统通知推送设置
          </p>
        </div>
      </div>

      {/* --- BEGIN COMMENT ---
      标签页导航 - 切换About和通知管理
      --- END COMMENT --- */}
      <ContentTabs 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* --- BEGIN COMMENT ---
      主内容区域 - 编辑器和预览面板
      --- END COMMENT --- */}
      <div className="flex-1 flex min-h-0">
        {/* --- BEGIN COMMENT ---
        左侧编辑面板
        --- END COMMENT --- */}
        <div className={cn(
          "border-r",
          isDark ? "bg-stone-800 border-stone-600" : "bg-white border-stone-200",
          showPreview ? "w-1/2 max-w-2xl" : "flex-1"
        )}>
          <div className="h-full overflow-auto">
            <div className="p-6">
              {activeTab === 'about' ? (
                <AboutEditor 
                  config={aboutConfig}
                  onChange={handleAboutConfigChange}
                />
              ) : (
                <NotificationEditor
                  notifications={notifications}
                  selectedNotification={selectedNotification}
                  onNotificationsChange={handleNotificationsChange}
                  onSelectedChange={handleSelectedNotificationChange}
                />
              )}
            </div>
          </div>
        </div>

        {/* --- BEGIN COMMENT ---
        右侧预览面板
        --- END COMMENT --- */}
        {showPreview && (
          <div className="flex-1 flex flex-col min-w-0">
            {/* --- BEGIN COMMENT ---
            预览工具栏
            --- END COMMENT --- */}
            <PreviewToolbar
              activeTab={activeTab}
              previewDevice={previewDevice}
              onDeviceChange={setPreviewDevice}
              showPreview={showPreview}
              onPreviewToggle={() => setShowPreview(!showPreview)}
            />
            
            {/* --- BEGIN COMMENT ---
            预览内容区域
            --- END COMMENT --- */}
            <div className="flex-1 p-4 min-h-0">
              {activeTab === 'about' ? (
                <AboutPreview 
                  config={aboutConfig}
                  previewDevice={previewDevice}
                />
              ) : (
                <NotificationPreview 
                  notification={selectedNotification}
                />
              )}
            </div>
          </div>
        )}

        {/* --- BEGIN COMMENT ---
        预览切换区域 (当预览面板隐藏时显示)
        --- END COMMENT --- */}
        {!showPreview && (
          <div className={cn(
            "w-16 border-r flex items-center justify-center",
            isDark ? "bg-stone-800 border-stone-600" : "bg-white border-stone-200"
          )}>
            <button
              onClick={() => setShowPreview(true)}
              className={cn(
                "p-3 rounded-lg transition-colors text-sm font-medium",
                isDark 
                  ? "bg-stone-700 hover:bg-stone-600 text-stone-300" 
                  : "bg-stone-100 hover:bg-stone-200 text-stone-600"
              )}
            >
              显示预览
            </button>
          </div>
        )}
      </div>

      {/* --- BEGIN COMMENT ---
      底部保存操作栏 - 保存、重置按钮和状态显示
      --- END COMMENT --- */}
      <SaveActions
        hasChanges={hasChanges}
        isSaving={isSaving}
        onSave={handleSave}
        onReset={handleReset}
      />
    </div>
  )
}
