"use client"

import React from "react"
import { FiRefreshCw } from "react-icons/fi"
import { MessageActionButton } from "@components/ui/message-action-button"
import { useRegenerateAction } from "../hooks/use-regenerate-action"
import { cn } from "@lib/utils"

interface RegenerateButtonProps {
  onRegenerate: () => void
  isRegenerating?: boolean
  tooltipPosition?: "top" | "bottom" | "left" | "right"
  tooltipSize?: "sm" | "md" // tooltip尺寸
  showTooltipArrow?: boolean // 是否显示tooltip箭头
  className?: string
}

/**
 * 重新生成按钮组件
 * 
 * 封装了重新生成功能的按钮，点击后会触发重新生成回调
 * 支持显示加载状态
 */
export const RegenerateButton: React.FC<RegenerateButtonProps> = ({
  onRegenerate,
  isRegenerating = false,
  tooltipPosition = "bottom",
  tooltipSize = "sm",
  showTooltipArrow = false,
  className
}) => {
  const { handleRegenerate } = useRegenerateAction(onRegenerate, isRegenerating)
  
  return (
    <MessageActionButton
      icon={FiRefreshCw}
      label="重新生成"
      onClick={handleRegenerate}
      disabled={isRegenerating}
      tooltipPosition={tooltipPosition}
      tooltipSize={tooltipSize}
      showTooltipArrow={showTooltipArrow}
      className={cn(
        isRegenerating ? "animate-spin" : "",
        className
      )}
    />
  )
}
