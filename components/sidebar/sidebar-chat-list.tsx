"use client"

import * as React from "react"
import { MessageSquare, ChevronDown, ChevronUp, Pin, Trash, Edit } from "lucide-react"
import { SidebarButton } from "./sidebar-button"
import { SidebarChatIcon } from "./sidebar-chat-icon"
import { cn } from "@lib/utils"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { MoreButton, DropdownMenu, PinButton } from "@components/ui"

// 示例数据 - 使用新的图标组件
const chatHistory = [
  { id: 1, title: "网站开发指南", icon: <SidebarChatIcon size="sm" />, isPinned: false },
  { id: 2, title: "JavaScript最佳实践", icon: <SidebarChatIcon size="sm" />, isPinned: true },
  { id: 3, title: "React Hooks详解", icon: <SidebarChatIcon size="sm" />, isPinned: false },
  { id: 4, title: "Grid与Flexbox比较", icon: <SidebarChatIcon size="sm" />, isPinned: false },
  { id: 5, title: "TypeScript技巧", icon: <SidebarChatIcon size="sm" />, isPinned: false },
  { id: 6, title: "Next.js App Router", icon: <SidebarChatIcon size="sm" />, isPinned: false },
]

interface SidebarChatListProps {
  isDark: boolean
  contentVisible: boolean
  /** 当前选中的聊天ID */
  selectedId: string | number | null
  /** 选中聊天项的回调函数 */
  onSelectChat: (chatId: string | number) => void
}

/**
 * 侧边栏聊天列表组件
 * 
 * 显示用户的聊天历史记录，支持折叠/展开和项目选择
 */
export function SidebarChatList({ 
  isDark, 
  contentVisible,
  selectedId,
  onSelectChat 
}: SidebarChatListProps) {
  const { lockExpanded } = useSidebarStore()
  const [showAllChats, setShowAllChats] = React.useState(false)
  const [pinnedChats, setPinnedChats] = React.useState(chatHistory.filter(chat => chat.isPinned));
  const [unpinnedChats, setUnpinnedChats] = React.useState(chatHistory.filter(chat => !chat.isPinned));
  
  // 根据是否展示全部聊天记录决定显示哪些未固定的聊天
  const visibleUnpinnedChats = showAllChats ? unpinnedChats : unpinnedChats.slice(0, 3);

  const toggleShowAllChats = () => {
    setShowAllChats(!showAllChats)
    lockExpanded() // Keep sidebar expanded when toggling
  }

  const handlePinChat = (chatId: number | string, isPinned: boolean) => {
    // 找到要修改的聊天
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;

    // 更新聊天的固定状态
    chat.isPinned = isPinned;
    
    // 重新计算固定和未固定的聊天列表
    setPinnedChats(chatHistory.filter(c => c.isPinned));
    setUnpinnedChats(chatHistory.filter(c => !c.isPinned));
  }

  const handleRenameChat = (chatId: number | string) => {
    console.log("重命名聊天:", chatId);
    // 这里可以添加重命名聊天的逻辑
  }

  const handleDeleteChat = (chatId: number | string) => {
    console.log("删除聊天:", chatId);
    // 这里可以添加删除聊天的逻辑
  }

  // 渲染单个聊天项
  const renderChatItem = (chat: typeof chatHistory[0]) => (
    <div key={chat.id} className="group relative flex items-center">
      <SidebarButton
        icon={chat.icon}
        text={chat.title}
        active={selectedId === chat.id}
        className="w-full pr-8 group"
        onClick={() => onSelectChat(chat.id)}
      />
      
      {/* 更多按钮 - 悬停时显示 */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2">
        <MoreButton 
          id={`chat-more-${chat.id}`}
          className="opacity-0 group-hover:opacity-100" 
          tooltipText="聊天选项"
        />
      </div>
      
      {/* 对应的下拉菜单 */}
      <DropdownMenu id={`chat-more-${chat.id}`}>
        <DropdownMenu.Item
          icon={<Pin className="w-4 h-4" />}
          onClick={() => handlePinChat(chat.id, !chat.isPinned)}
        >
          {chat.isPinned ? "取消固定" : "固定聊天"}
        </DropdownMenu.Item>
        
        <DropdownMenu.Item
          icon={<Edit className="w-4 h-4" />}
          onClick={() => handleRenameChat(chat.id)}
        >
          重命名
        </DropdownMenu.Item>
        
        <DropdownMenu.Divider />
        
        <DropdownMenu.Item
          icon={<Trash className="w-4 h-4" />}
          danger
          onClick={() => handleDeleteChat(chat.id)}
        >
          删除聊天
        </DropdownMenu.Item>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="space-y-3 px-3">
      <div className={cn(
        "px-3 text-xs font-semibold flex items-center gap-2",
        isDark ? "text-blue-400" : "text-primary/90"
      )}>
        <MessageSquare className="h-3.5 w-3.5" />
        <span>对话列表</span>
      </div>
      
      <div className="space-y-1.5">
        {/* 固定的聊天 */}
        {pinnedChats.length > 0 && (
          <>
            {pinnedChats.map(renderChatItem)}
            {unpinnedChats.length > 0 && <div className="my-2 border-t border-gray-200 dark:border-gray-700" />}
          </>
        )}
        
        {/* 未固定的聊天 */}
        {visibleUnpinnedChats.map(renderChatItem)}
        
        {/* 更多按钮 */}
        {unpinnedChats.length > 3 && (
          <SidebarButton
            icon={showAllChats 
              ? <ChevronUp className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" /> 
              : <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
            }
            text={showAllChats ? "收起" : "更多"}
            className={cn(
              "w-full text-xs group",
              isDark ? "text-gray-500" : "text-muted-foreground"
            )}
            onClick={toggleShowAllChats}
          />
        )}
      </div>
    </div>
  )
} 