'use client';

import { MessageActionButton } from '@components/ui/message-action-button';
import { MessageActionsContainer } from '@components/ui/message-actions-container';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import {
  FiCheck,
  FiCopy,
  FiRefreshCw,
  FiThumbsDown,
  FiThumbsUp,
} from 'react-icons/fi';

import React from 'react';

interface AssistantMessageActionsProps {
  messageId: string;
  onCopy: () => void;
  onRegenerate: () => void;
  onFeedback: (isPositive: boolean) => void;
  className?: string;
  isRegenerating?: boolean;
}

export const AssistantMessageActions: React.FC<
  AssistantMessageActionsProps
> = ({
  onCopy,
  onRegenerate,
  onFeedback,
  className,
  isRegenerating = false,
}) => {
  const { isDark } = useTheme();

  return (
    <MessageActionsContainer
      align="left"
      isAssistantMessage={true}
      className={className}
    >
      <MessageActionButton
        icon={FiCopy}
        activeIcon={FiCheck}
        label="复制"
        activeLabel="已复制"
        onClick={onCopy}
        tooltipPosition="bottom"
      />
      <MessageActionButton
        icon={FiRefreshCw}
        label="重新生成"
        onClick={onRegenerate}
        disabled={isRegenerating}
        className={isRegenerating ? 'animate-spin' : ''}
        tooltipPosition="bottom"
      />
      <div
        className={cn(
          'mx-1 self-stretch border-r',
          isDark ? 'border-gray-700' : 'border-gray-300'
        )}
      />
      <MessageActionButton
        icon={FiThumbsUp}
        label="有用"
        activeLabel="已评价"
        onClick={() => onFeedback(true)}
        tooltipPosition="bottom"
      />
      <MessageActionButton
        icon={FiThumbsDown}
        label="无用"
        activeLabel="已评价"
        onClick={() => onFeedback(false)}
        tooltipPosition="bottom"
      />
    </MessageActionsContainer>
  );
};
