'use client';

import { Tooltip, type TooltipProps } from '@components/ui/tooltip';
import { ClientRender } from '@lib/utils/client-render';

import { ReactNode } from 'react';

interface TooltipWrapperProps extends Omit<TooltipProps, 'children'> {
  children: ReactNode;
  /**
   * 是否只在非移动设备上显示提示
   * 如果为true，移动设备上将不显示tooltip（默认由Tooltip组件已处理）
   */
  _desktopOnly?: boolean;
}

/**
 * Tooltip包装器组件
 *
 * 增强原始Tooltip组件，解决服务端渲染和客户端渲染不匹配问题
 * 在服务器端渲染时仅渲染子元素，在客户端渲染时才添加Tooltip功能
 */
export function TooltipWrapper({
  children,
  ...tooltipProps
}: TooltipWrapperProps) {
  return (
    <ClientRender fallback={children}>
      {clientProps => <Tooltip {...tooltipProps}>{children}</Tooltip>}
    </ClientRender>
  );
}
