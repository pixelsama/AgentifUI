import { create } from 'zustand'

export interface ChatflowNode {
  id: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: number
  endTime?: number
  description?: string
  type?: string
  visible?: boolean
  
  // 🎯 新增：迭代支持
  iterations?: ChatflowIteration[]
  currentIteration?: number
  totalIterations?: number
  isIterationNode?: boolean
  
  // 🎯 新增：节点是否在迭代中
  isInIteration?: boolean
  iterationIndex?: number
  
  // 🎯 新增：并行分支支持
  parallelBranches?: ChatflowParallelBranch[]
  totalBranches?: number
  completedBranches?: number
  isParallelNode?: boolean
}

// 🎯 新增：迭代数据结构
export interface ChatflowIteration {
  id: string
  index: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime: number
  endTime?: number
  inputs?: Record<string, any>
  outputs?: Record<string, any>
  error?: string
  description?: string
}

// 🎯 新增：并行分支数据结构
export interface ChatflowParallelBranch {
  id: string
  index: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime: number
  endTime?: number
  inputs?: Record<string, any>
  outputs?: Record<string, any>
  error?: string
  description?: string
}

interface ChatflowExecutionState {
  // 节点状态
  nodes: ChatflowNode[]
  currentNodeId: string | null
  isExecuting: boolean
  
  // 🎯 新增：当前迭代状态跟踪
  currentIteration: {
    nodeId: string
    iterationId: string
    index: number
    totalIterations: number
    startTime: number
    status: 'running' | 'completed'
  } | null
  
  // 执行进度
  executionProgress: {
    current: number
    total: number
    percentage: number
  }
  
  // 错误状态
  error: string | null
  canRetry: boolean
  
  // Actions
  startExecution: () => void
  stopExecution: () => void
  resetExecution: () => void
  
  addNode: (node: ChatflowNode) => void
  updateNode: (nodeId: string, updates: Partial<ChatflowNode>) => void
  setCurrentNode: (nodeId: string | null) => void
  
  // 🎯 新增：迭代相关的actions
  addIteration: (nodeId: string, iteration: ChatflowIteration) => void
  updateIteration: (nodeId: string, iterationId: string, updates: Partial<ChatflowIteration>) => void
  completeIteration: (nodeId: string, iterationId: string) => void
  
  // 🎯 新增：并行分支相关的actions
  addParallelBranch: (nodeId: string, branch: ChatflowParallelBranch) => void
  updateParallelBranch: (nodeId: string, branchId: string, updates: Partial<ChatflowParallelBranch>) => void
  completeParallelBranch: (nodeId: string, branchId: string, status: 'completed' | 'failed') => void
  
  setError: (error: string | null) => void
  setCanRetry: (canRetry: boolean) => void
  
  // 从 SSE 事件更新状态
  handleNodeEvent: (event: any) => void
}

export const useChatflowExecutionStore = create<ChatflowExecutionState>((set, get) => ({
  // 初始状态
  nodes: [],
  currentNodeId: null,
  isExecuting: false,
  currentIteration: null,
  
  executionProgress: {
    current: 0,
    total: 0,
    percentage: 0
  },
  
  error: null,
  canRetry: false,
  
  // Actions
  startExecution: () => {
    console.log('[ChatflowExecution] 开始执行')
    set({
      isExecuting: true,
      error: null,
      canRetry: false,
      nodes: [],
      currentNodeId: null,
      executionProgress: { current: 0, total: 0, percentage: 0 }
    })
  },
  
  stopExecution: () => {
    const { nodes } = get()
    const updatedNodes = nodes.map(node => 
      node.status === 'running' 
        ? { ...node, status: 'failed' as const, endTime: Date.now() }
        : node
    )
    
    set({
      isExecuting: false,
      nodes: updatedNodes,
      currentNodeId: null,
      canRetry: true
    })
  },
  
  resetExecution: () => {
    set({
      nodes: [],
      currentNodeId: null,
      isExecuting: false,
      executionProgress: { current: 0, total: 0, percentage: 0 },
      error: null,
      canRetry: false
    })
  },
  
  addNode: (node: ChatflowNode) => {
    set(state => ({
      nodes: [...state.nodes, node]
    }))
  },
  
  updateNode: (nodeId: string, updates: Partial<ChatflowNode>) => {
    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }))
    
    // 更新进度
    const { nodes } = get()
    const completedNodes = nodes.filter(n => n.status === 'completed').length
    const totalNodes = nodes.length
    
    set({
      executionProgress: {
        current: completedNodes,
        total: totalNodes,
        percentage: totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0
      }
    })
  },
  
  setCurrentNode: (nodeId: string | null) => {
    set({ currentNodeId: nodeId })
  },
  
  // 🎯 新增：迭代相关的actions
  addIteration: (nodeId: string, iteration: ChatflowIteration) => {
    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId ? { ...node, iterations: [...(node.iterations || []), iteration] } : node
      )
    }))
  },
  
  updateIteration: (nodeId: string, iterationId: string, updates: Partial<ChatflowIteration>) => {
    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId ? {
          ...node,
          iterations: node.iterations?.map(iteration =>
            iteration.id === iterationId ? { ...iteration, ...updates } : iteration
          )
        } : node
      )
    }))
  },
  
  completeIteration: (nodeId: string, iterationId: string) => {
    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId ? {
          ...node,
          iterations: node.iterations?.filter(iteration => iteration.id !== iterationId)
        } : node
      )
    }))
  },
  
  // 🎯 新增：并行分支相关的actions
  addParallelBranch: (nodeId: string, branch: ChatflowParallelBranch) => {
    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId ? { ...node, parallelBranches: [...(node.parallelBranches || []), branch] } : node
      )
    }))
  },
  
  updateParallelBranch: (nodeId: string, branchId: string, updates: Partial<ChatflowParallelBranch>) => {
    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId ? {
          ...node,
          parallelBranches: node.parallelBranches?.map(branch =>
            branch.id === branchId ? { ...branch, ...updates } : branch
          )
        } : node
      )
    }))
  },
  
  completeParallelBranch: (nodeId: string, branchId: string, status: 'completed' | 'failed') => {
    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId ? {
          ...node,
          parallelBranches: node.parallelBranches?.filter(branch => branch.id !== branchId)
        } : node
      )
    }))
  },
  
  setError: (error: string | null) => {
    set({ error, canRetry: !!error })
  },
  
  setCanRetry: (canRetry: boolean) => {
    set({ canRetry })
  },
  
  // 处理 SSE 事件
  handleNodeEvent: (event: any) => {
    const { nodes } = get()
    
    console.log('[ChatflowExecution] 🎯 收到节点事件:', event.event)
    console.log('[ChatflowExecution] 节点数据:', event.data)
    console.log('[ChatflowExecution] 当前节点数量:', nodes.length)
    
    switch (event.event) {
      case 'node_started':
        // 添加或更新节点为运行状态
        const { node_id, title, node_type } = event.data
        const nodeTitle = title || node_type || `节点 ${nodes.length + 1}`
        const { currentIteration } = get()
        
        // 检查是否在迭代中
        const isInIteration = !!(currentIteration && currentIteration.status === 'running')
        
        console.log('[ChatflowExecution] 🎯 节点开始:', {
          nodeId: node_id,
          title: nodeTitle,
          isInIteration,
          iterationInfo: isInIteration ? `第${currentIteration.index}轮` : '无'
        })
        
        const existingNodeIndex = nodes.findIndex(n => n.id === node_id)
        
        if (existingNodeIndex >= 0) {
          // 更新现有节点
          get().updateNode(node_id, {
            status: 'running',
            startTime: Date.now(),
            description: '正在执行...',
            type: node_type,
            isInIteration: isInIteration,
            iterationIndex: isInIteration ? currentIteration.index : undefined
          })
        } else {
          // 添加新节点
          get().addNode({
            id: node_id,
            title: nodeTitle,
            status: 'running',
            startTime: Date.now(),
            description: '正在执行...',
            type: node_type,
            visible: true,
            isInIteration: isInIteration,
            iterationIndex: isInIteration ? currentIteration.index : undefined
          })
        }
        
        get().setCurrentNode(node_id)
        break
        
      case 'node_finished':
        // 更新节点为完成状态
        const { node_id: finishedNodeId, status, error } = event.data
        const nodeStatus = status === 'succeeded' ? 'completed' : 'failed'
        
        get().updateNode(finishedNodeId, {
          status: nodeStatus,
          endTime: Date.now(),
          description: nodeStatus === 'completed' ? '执行完成' : (error || '执行失败')
        })
        break
        
      case 'node_failed':
        // 更新节点为失败状态
        get().updateNode(event.data.node_id, {
          status: 'failed',
          endTime: Date.now(),
          description: event.data.error || '执行失败'
        })
        
        get().setError(event.data.error || '节点执行失败')
        break
        
      case 'workflow_started':
        get().startExecution()
        break
        
      case 'workflow_finished':
        set({ isExecuting: false, currentNodeId: null })
        break
        
      case 'workflow_interrupted':
        get().stopExecution()
        get().setError('工作流被中断')
        break
        
      case 'iteration_started':
        console.log('[ChatflowExecution] 🔍 迭代开始事件详细数据:', JSON.stringify(event.data, null, 2))
        
        const { node_id: iterNodeId, iteration_id, iteration_index, title: iterTitle, node_type: iterNodeType } = event.data
        const totalIterations = event.data.metadata?.iterator_length || event.data.total_iterations || 1
        
        console.log('[ChatflowExecution] 🎯 开始新迭代:', {
          nodeId: iterNodeId,
          iterationId: iteration_id,
          index: iteration_index || 1,
          total: totalIterations
        })
        
        // 设置当前迭代状态 - 后续的节点都会归属到这个迭代
        set({
          currentIteration: {
            nodeId: iterNodeId,
            iterationId: iteration_id || `iter-${Date.now()}`,
            index: iteration_index || 1,
            totalIterations: totalIterations,
            startTime: Date.now(),
            status: 'running'
          }
        })
        
        // 创建迭代容器节点（如果不存在）
        const existingIterNode = nodes.find(n => n.id === iterNodeId)
        if (!existingIterNode) {
          console.log('[ChatflowExecution] 🎯 创建迭代容器节点:', iterNodeId)
          get().addNode({
            id: iterNodeId,
            title: iterTitle || '迭代',
            status: 'running',
            startTime: Date.now(),
            description: `第 ${iteration_index || 1} 轮 / 共 ${totalIterations} 轮`,
            type: iterNodeType || 'iteration',
            visible: true,
            isIterationNode: true,
            totalIterations: totalIterations,
            currentIteration: iteration_index || 1
          })
        } else {
          // 更新现有迭代容器
          get().updateNode(iterNodeId, {
            description: `第 ${iteration_index || 1} 轮 / 共 ${totalIterations} 轮`,
            currentIteration: iteration_index || 1,
            status: 'running'
          })
        }
        break
        
      case 'iteration_next':
        const { node_id: nextNodeId, iteration_index: nextIndex } = event.data
        const { currentIteration: currentIter } = get()
        
        if (currentIter && currentIter.nodeId === nextNodeId) {
          console.log('[ChatflowExecution] 🎯 迭代进入下一轮:', nextIndex)
          // 更新当前迭代状态
          set({
            currentIteration: {
              ...currentIter,
              index: nextIndex,
              startTime: Date.now() // 重置开始时间
            }
          })
          
          // 更新迭代容器节点
          get().updateNode(nextNodeId, {
            description: `第 ${nextIndex} 轮 / 共 ${currentIter.totalIterations} 轮`,
            currentIteration: nextIndex
          })
        }
        break
        
      case 'iteration_completed':
        const { node_id: completedNodeId } = event.data
        const { currentIteration: completedIter } = get()
        
        if (completedIter && completedIter.nodeId === completedNodeId) {
          console.log('[ChatflowExecution] 🎯 迭代完成:', completedNodeId)
          // 清除当前迭代状态
          set({ currentIteration: null })
          
          // 更新迭代容器节点为完成状态
          get().updateNode(completedNodeId, {
            status: 'completed',
            endTime: Date.now(),
            description: `迭代完成 (共 ${completedIter.totalIterations} 轮)`
          })
        }
        break
        
      case 'parallel_branch_started':
        const { node_id: branchNodeId, branch_id, branch_index, total_branches } = event.data
        
        // 确保节点存在并标记为并行节点
        const branchNode = nodes.find(n => n.id === branchNodeId)
        if (branchNode) {
          get().updateNode(branchNodeId, {
            isParallelNode: true,
            totalBranches: total_branches
          })
        }
        
        // 添加新的并行分支
        get().addParallelBranch(branchNodeId, {
          id: branch_id,
          index: branch_index,
          status: 'running',
          startTime: Date.now(),
          inputs: event.data.inputs,
          description: `分支 ${branch_index}`
        })
        break
        
      case 'parallel_branch_finished':
        const { node_id: finishedBranchNodeId, branch_id: finishedBranchId, status: branchStatus, error: branchError } = event.data
        get().updateParallelBranch(finishedBranchNodeId, finishedBranchId, {
          status: branchStatus === 'succeeded' ? 'completed' : 'failed',
          endTime: Date.now(),
          outputs: event.data.outputs,
          error: branchError,
          description: branchStatus === 'succeeded' ? '分支完成' : '分支失败'
        })
        break
        
      default:
        console.log('[ChatflowExecution] 未知事件类型:', event.event)
        break
    }
  }
})) 