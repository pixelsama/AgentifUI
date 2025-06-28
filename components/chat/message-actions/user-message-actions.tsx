'use client';

import { MessageActionsContainer } from '@components/ui/message-actions-container';

import React from 'react';

import { CopyButton } from './buttons/copy-button';
import { EditButton } from './buttons/edit-button';

interface UserMessageActionsProps {
  messageId: string;
  content: string;
  onEdit: () => void;
  className?: string;
  // tooltip配置
  tooltipSize?: 'sm' | 'md';
  showTooltipArrow?: boolean;
}

/**
 * 用户消息操作按钮组件
 *
 * 组合了复制和编辑按钮，用于用户消息下方的操作区域
 */
export const UserMessageActions: React.FC<UserMessageActionsProps> = ({
  messageId,
  content,
  onEdit,
  className,
  tooltipSize = 'sm',
  showTooltipArrow = false,
}) => {
  return (
    <MessageActionsContainer align="right" className={className}>
      <CopyButton
        content={content}
        tooltipSize={tooltipSize}
        showTooltipArrow={showTooltipArrow}
      />
      <EditButton
        onEdit={onEdit}
        tooltipSize={tooltipSize}
        showTooltipArrow={showTooltipArrow}
      />
    </MessageActionsContainer>
  );
};
