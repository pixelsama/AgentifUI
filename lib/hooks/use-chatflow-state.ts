import React from 'react';
import { useChatflowInterface } from '@lib/hooks/use-chatflow-interface';
import { useChatInterface } from '@lib/hooks/use-chat-interface';

/**
 * Chatflow状态管理Hook
 * 
 * 功能：
 * - 根据应用类型选择正确的接口
 * - 管理节点跟踪器显示状态
 * - 自动响应节点执行状态
 */
export function useChatflowState(isChatflowApp: boolean) {
  const chatflowInterface = useChatflowInterface();
  const regularInterface = useChatInterface();
  
  // 🎯 根据应用类型选择正确的接口
  const chatInterface = isChatflowApp ? chatflowInterface : regularInterface;
  
  // 🎯 nodeTracker只在chatflow应用中有效
  const nodeTracker = isChatflowApp ? chatflowInterface.nodeTracker : { 
    nodes: [], 
    isExecuting: false, 
    executionProgress: { current: 0, total: 0, percentage: 0 }, 
    error: null 
  };
  
  // 🎯 节点跟踪器显示状态
  const [showNodeTracker, setShowNodeTracker] = React.useState(false);
  
  // 🎯 悬浮球显示逻辑：在chatflow应用中始终显示
  const showFloatingController = isChatflowApp;
  
  // 🎯 监听节点执行状态，自动显示节点跟踪器
  React.useEffect(() => {
    if (!isChatflowApp) return;
    
    const hasNodes = nodeTracker?.nodes?.length > 0;
    const isExecuting = nodeTracker?.isExecuting;
    
    // 当开始执行或有节点数据时，自动显示跟踪器
    if (hasNodes || isExecuting) {
      setShowNodeTracker(true);
    }
  }, [isChatflowApp, nodeTracker?.nodes?.length, nodeTracker?.isExecuting]);
  
  return {
    // 聊天接口
    messages: chatInterface.messages,
    handleSubmit: chatInterface.handleSubmit,
    isProcessing: chatInterface.isProcessing,
    handleStopProcessing: chatInterface.handleStopProcessing,
    sendDirectMessage: chatInterface.sendDirectMessage,
    
    // Chatflow相关
    nodeTracker,
    showNodeTracker,
    setShowNodeTracker,
    showFloatingController
  };
} 