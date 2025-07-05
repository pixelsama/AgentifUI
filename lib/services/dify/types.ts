/**
 * Dify API 类型定义
 * @description 定义与 Dify API 交互相关的数据结构
 * @see https://docs.dify.ai/
 */

/**
 * Dify 文件对象结构
 * @description 用于请求体中的文件上传
 */
export interface DifyFile {
  /** 文件类型 */
  type: 'image' | 'document' | 'audio' | 'video' | 'custom';
  /** 传输方式 */
  transfer_method: 'remote_url' | 'local_file';
  /** 远程URL，当transfer_method为remote_url时必需 */
  url?: string;
  /** 本地文件ID，当transfer_method为local_file时必需 */
  upload_file_id?: string;
}

/**
 * Dify 聊天消息请求体
 * @description 发送给 Dify API 的聊天请求数据结构
 */
export interface DifyChatRequestPayload {
  /** 用户输入内容 */
  query: string;
  /** App 输入变量，默认为空对象 */
  inputs?: Record<string, any>;
  /** 响应模式 */
  response_mode: 'streaming' | 'blocking';
  /** 用户唯一标识符 */
  user: string;
  /** 对话ID，null或空字符串表示新对话 */
  conversation_id?: string | null;
  /** 文件列表 */
  files?: DifyFile[];
  /** 是否自动生成标题，默认true */
  auto_generate_name?: boolean;
}

/**
 * SSE事件基础结构
 * @description 所有Dify SSE事件的基础接口
 */
interface DifySseBaseEvent {
  /** 任务ID */
  task_id: string;
  /** 事件或消息ID */
  id?: string;
  /** 对话ID */
  conversation_id: string;
  /** 事件类型 */
  event: string;
}

/**
 * 消息文本块事件
 * @description event: message - LLM返回的文本块内容
 */
export interface DifySseMessageEvent extends DifySseBaseEvent {
  event: 'message';
  /** 消息ID */
  id: string;
  /** LLM返回的文本块内容 */
  answer: string;
  /** 创建时间戳 */
  created_at: number;
}

/**
 * 消息文件事件
 * @description event: message_file - 文件消息
 */
export interface DifySseMessageFileEvent extends DifySseBaseEvent {
  event: 'message_file';
  /** 文件ID */
  id: string;
  /** 文件类型 */
  type: string;
  /** 文件归属方 */
  belongs_to: 'user' | 'assistant';
  /** 文件访问地址 */
  url: string;
}

/**
 * 消息结束事件
 * @description event: message_end - 消息传输完成
 */
export interface DifySseMessageEndEvent extends DifySseBaseEvent {
  event: 'message_end';
  /** 消息ID */
  id: string;
  /** 元数据 */
  metadata: Record<string, any>;
  /** 模型用量信息 */
  usage: DifyUsage;
  /** 引用和归属资源 */
  retriever_resources?: DifyRetrieverResource[];
}

/**
 * TTS音频块事件
 * @description event: tts_message - 文本转语音音频块
 */
export interface DifySseTtsMessageEvent extends DifySseBaseEvent {
  event: 'tts_message';
  /** 消息ID */
  id: string;
  /** Base64编码的音频块 */
  audio: string;
  /** 创建时间戳 */
  created_at: number;
}

/**
 * TTS结束事件
 * @description event: tts_message_end - TTS传输结束
 */
export interface DifySseTtsMessageEndEvent extends DifySseBaseEvent {
  event: 'tts_message_end';
  /** 消息ID */
  id: string;
  /** 空音频字符串 */
  audio: string;
  /** 创建时间戳 */
  created_at: number;
}

/**
 * 消息替换事件
 * @description event: message_replace - 内容替换
 */
export interface DifySseMessageReplaceEvent extends DifySseBaseEvent {
  event: 'message_replace';
  /** 消息ID */
  id: string;
  /** 替换后的完整内容 */
  answer: string;
  /** 创建时间戳 */
  created_at: number;
}

/**
 * 工作流开始事件
 * @description event: workflow_started - 工作流执行开始
 */
export interface DifySseWorkflowStartedEvent extends DifySseBaseEvent {
  event: 'workflow_started';
  /** 工作流运行ID */
  workflow_run_id: string;
  /** 工作流数据 */
  data: {
    id: string;
    workflow_id: string;
    sequence_number: number;
    created_at: number;
  };
}

/**
 * 节点开始事件
 * @description event: node_started - 工作流节点开始执行
 */
export interface DifySseNodeStartedEvent extends DifySseBaseEvent {
  event: 'node_started';
  /** 工作流运行ID */
  workflow_run_id: string;
  /** 节点数据 */
  data: {
    id: string;
    node_id: string;
    node_type: string;
    title: string;
    index: number;
    predecessor_node_id?: string;
    inputs: Record<string, any>;
    created_at: number;
  };
}

/**
 * 节点结束事件
 * @description event: node_finished - 工作流节点执行完成
 */
export interface DifySseNodeFinishedEvent extends DifySseBaseEvent {
  event: 'node_finished';
  /** 工作流运行ID */
  workflow_run_id: string;
  /** 节点执行结果数据 */
  data: {
    id: string;
    node_id: string;
    index: number;
    predecessor_node_id?: string;
    inputs?: Record<string, any>;
    process_data?: any;
    outputs?: any;
    status: 'running' | 'succeeded' | 'failed' | 'stopped';
    error?: string;
    elapsed_time?: number;
    execution_metadata?: any;
    total_tokens?: number;
    total_price?: string;
    currency?: string;
    created_at: number;
  };
}

/**
 * 工作流结束事件
 * @description event: workflow_finished - 工作流执行完成
 */
export interface DifySseWorkflowFinishedEvent extends DifySseBaseEvent {
  event: 'workflow_finished';
  /** 工作流运行ID */
  workflow_run_id: string;
  /** 工作流执行结果数据 */
  data: {
    id: string;
    workflow_id: string;
    status: 'running' | 'succeeded' | 'failed' | 'stopped';
    outputs?: any;
    error?: string;
    elapsed_time?: number;
    total_tokens?: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
}

/**
 * 流错误事件
 * @description event: error - SSE流处理错误
 */
export interface DifySseErrorEvent extends DifySseBaseEvent {
  event: 'error';
  /** 消息ID，可能为空 */
  id?: string;
  /** HTTP状态码 */
  status: number;
  /** 错误码 */
  code: string;
  /** 错误消息 */
  message: string;
}

/**
 * 保持连接事件
 * @description event: ping - 心跳包，保持SSE连接
 */
export interface DifySsePingEvent extends DifySseBaseEvent {
  event: 'ping';
}

/**
 * Agent思考过程事件
 * @description event: agent_thought - Agent的思考过程
 */
export interface DifySseAgentThoughtEvent extends DifySseBaseEvent {
  event: 'agent_thought';
  /** Agent思考消息ID */
  id: string;
  /** 关联的消息ID */
  message_id: string;
  /** 位置序号 */
  position: number;
  /** 思考过程的文本内容 */
  thought: string;
  /** 观察结果 */
  observation: string;
  /** 使用的工具 */
  tool: string;
  /** 工具标签 */
  tool_labels: Record<string, any>;
  /** 工具输入 */
  tool_input: string;
  /** 消息文件 */
  message_files: any[];
  /** 创建时间戳 */
  created_at: number;
}

/**
 * Agent消息事件
 * @description event: agent_message - Agent应用的流式回答内容
 */
export interface DifySseAgentMessageEvent extends DifySseBaseEvent {
  event: 'agent_message';
  /** Agent消息ID */
  id: string;
  /** 关联的消息ID */
  message_id: string;
  /** Agent回答的文本块 */
  answer: string;
  /** 创建时间戳 */
  created_at: number;
}

/**
 * Dify模型用量信息
 * @description 记录API调用的token使用情况和费用
 */
export interface DifyUsage {
  /** 提示词token数量 */
  prompt_tokens?: number;
  /** 提示词单价 */
  prompt_unit_price?: string;
  /** 提示词价格单位 */
  prompt_price_unit?: string;
  /** 提示词总价 */
  prompt_price?: string;
  /** 完成词token数量 */
  completion_tokens?: number;
  /** 完成词单价 */
  completion_unit_price?: string;
  /** 完成词价格单位 */
  completion_price_unit?: string;
  /** 完成词总价 */
  completion_price?: string;
  /** 总token数量 */
  total_tokens: number;
  /** 总费用 */
  total_price?: string;
  /** 货币 */
  currency?: string;
  /** 延迟 */
  latency?: number;
}

/**
 * Dify 引用和归属信息
 * @description 记录引用和归属信息
 */
export interface DifyRetrieverResource {
  /** 段落ID */
  segment_id: string;
  /** 文档ID */
  document_id: string;
  /** 文档名称 */
  document_name: string;
  /** 位置 */
  position: number;
  /** 内容 */
  content: string;
  /** 分数 */
  score?: number;
  // 其他可能的字段
}

/**
 * 迭代开始事件
 * @description event: iteration_started - 迭代开始
 */
export interface DifySseIterationStartedEvent extends DifySseBaseEvent {
  event: 'iteration_started';
  /** 工作流运行ID */
  workflow_run_id: string;
  /** 节点数据 */
  data: {
    id: string;
    node_id: string;
    node_type: string;
    title: string;
    iteration_id: string;
    iteration_index: number;
    total_iterations?: number;
    inputs: Record<string, any>;
    created_at: number;
  };
}

/**
 * 迭代下一轮事件
 * @description event: iteration_next - 迭代下一轮
 */
export interface DifySseIterationNextEvent extends DifySseBaseEvent {
  event: 'iteration_next';
  /** 工作流运行ID */
  workflow_run_id: string;
  /** 节点数据 */
  data: {
    id: string;
    node_id: string;
    iteration_id: string;
    iteration_index: number;
    outputs?: Record<string, any>;
    created_at: number;
  };
}

/**
 * 迭代完成事件
 * @description event: iteration_completed - 迭代完成
 */
export interface DifySseIterationCompletedEvent extends DifySseBaseEvent {
  event: 'iteration_completed';
  /** 工作流运行ID */
  workflow_run_id: string;
  /** 节点数据 */
  data: {
    id: string;
    node_id: string;
    iteration_id: string;
    total_iterations: number;
    outputs: Record<string, any>;
    elapsed_time: number;
    created_at: number;
  };
}

/**
 * 并行分支开始事件
 * @description event: parallel_branch_started - 并行分支开始
 */
export interface DifySseParallelBranchStartedEvent extends DifySseBaseEvent {
  event: 'parallel_branch_started';
  /** 工作流运行ID */
  workflow_run_id: string;
  /** 节点数据 */
  data: {
    id: string;
    node_id: string;
    branch_id: string;
    branch_index: number;
    total_branches?: number;
    inputs: Record<string, any>;
    created_at: number;
  };
}

/**
 * 并行分支结束事件
 * @description event: parallel_branch_finished - 并行分支结束
 */
export interface DifySseParallelBranchFinishedEvent extends DifySseBaseEvent {
  event: 'parallel_branch_finished';
  /** 工作流运行ID */
  workflow_run_id: string;
  /** 节点数据 */
  data: {
    id: string;
    node_id: string;
    branch_id: string;
    branch_index: number;
    status: 'succeeded' | 'failed' | 'stopped';
    outputs?: Record<string, any>;
    error?: string;
    elapsed_time: number;
    created_at: number;
  };
}

// 新增：循环(Loop)相关的SSE事件类型
// Loop与Iteration的区别：
// - Loop：基于条件判断的重复执行，可能无限循环或基于计数器
// - Iteration：基于输入数据列表的遍历执行，有明确的结束条件
/**
 * 循环开始事件
 * @description event: loop_started - 循环开始
 */
export interface DifySseLoopStartedEvent extends DifySseBaseEvent {
  event: 'loop_started';
  /** 工作流运行ID */
  workflow_run_id: string;
  /** 节点数据 */
  data: {
    id: string;
    node_id: string;
    node_type: string;
    title: string;
    inputs: Record<string, any>;
    metadata?: { loop_length?: number }; // 循环限制信息
    created_at: number;
  };
}

/**
 * 循环下一轮事件
 * @description event: loop_next - 循环下一轮
 */
export interface DifySseLoopNextEvent extends DifySseBaseEvent {
  event: 'loop_next';
  /** 工作流运行ID */
  workflow_run_id: string;
  /** 节点数据 */
  data: {
    id: string;
    node_id: string;
    node_type: string;
    title: string;
    index: number;
    pre_loop_output?: Record<string, any>;
    created_at: number;
  };
}

/**
 * 循环完成事件
 * @description event: loop_completed - 循环完成
 */
export interface DifySseLoopCompletedEvent extends DifySseBaseEvent {
  event: 'loop_completed';
  /** 工作流运行ID */
  workflow_run_id: string;
  /** 节点数据 */
  data: {
    id: string;
    node_id: string;
    // 🎯 修复：实际数据中没有total_loops字段，需要从其他地方推断
    outputs?: Record<string, any>;
    elapsed_time?: number;
    created_at: number;
  };
}

// --- 服务函数返回类型 --- (供 Hook 使用)

export interface DifyStreamResponse {
  // 经过处理的文本块流，只包含 `event: message` 中的 `answer` 字段内容。
  // 服务层负责解析 SSE 并过滤出文本。
  answerStream: AsyncGenerator<string, void, undefined>;

  // 提供方法以在流处理过程中或结束后获取 conversation_id。
  // 该方法在流开始时返回 null，在流中捕获到 ID 后返回 ID。
  getConversationId: () => string | null;

  // 提供方法以在流处理过程中或结束后获取 task_id。
  getTaskId: () => string | null;

  // 可以添加一个 Promise，在 message_end 事件到达时 resolve，
  // 并携带最终的 usage 和 metadata 等信息，供需要完整响应的场景使用。
  completionPromise?: Promise<{
    usage?: DifyUsage;
    metadata?: Record<string, any>;
    retrieverResources?: DifyRetrieverResource[];
  }>;

  // 可能还需要传递其他从流中提取的非文本事件，如文件事件等，根据需求添加。
  // fileEventsStream?: AsyncGenerator<DifySseMessageFileEvent, void, undefined>;
}

// Dify 停止流式任务 API 类型
// POST /chat-messages/:task_id/stop
/**
 * Dify 停止任务请求体
 * @description 用于停止流式任务的请求数据结构
 */
export interface DifyStopTaskRequestPayload {
  /** 用户唯一标识符，必须和发送消息时一致 */
  user: string;
}

/**
 * Dify 停止任务响应体
 * @description 用于停止流式任务的响应数据结构
 */
export interface DifyStopTaskResponse {
  result: 'success'; // 固定返回 success
}

/**
 * Dify file upload API response
 * @description POST /files/upload
 */
export interface DifyFileUploadResponse {
  id: string; // File ID (UUID)
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_by: string | number; // User ID (can be number or string)
  created_at: number; // Unix timestamp
}

/**
 * Messages API Type Definitions
 * @description Type definitions for Dify messages API endpoints
 */

// /messages API - Common error response structure
// This can be used as type reference for message-service.ts error handling
export interface DifyApiError {
  status: number; // HTTP status code
  code: string; // Dify internal error code or HTTP status code string
  message: string; // Error description
  [key: string]: any; // Allow other possible error fields like validation_errors from Dify
}

// /messages API - Message file object structure
export interface DifyMessageFile {
  id: string; // File ID
  type: string; // File type, e.g. "image"
  url: string; // File preview URL
  belongs_to: 'user' | 'assistant'; // File owner: "user" or "assistant"
}

// /messages API - Message feedback information structure
export interface DifyMessageFeedback {
  rating: 'like' | 'dislike' | null; // Like 'like' / Dislike 'dislike', or null
  // May have other feedback-related fields based on actual API, e.g. content
}

// /messages API - 单条消息对象结构 (与 SSE 中的 DifyMessage 不同，这是获取历史消息的特定结构)
export interface ConversationMessage {
  id: string; // 消息的唯一 ID
  conversation_id: string; // 该消息所属的会话 ID
  inputs: Record<string, any>; // 用户输入的参数，具体内容取决于应用设计
  query: string; // 用户发送的原始提问内容
  answer: string; // AI 助手的回答内容
  message_files: DifyMessageFile[]; // 消息中包含的文件列表
  created_at: number; // 消息创建的时间戳 (Unix timestamp)
  feedback: DifyMessageFeedback | null; // 用户对这条回答的反馈信息
  retriever_resources: DifyRetrieverResource[]; // 引用和归属分段列表
}

// /messages API - 获取历史消息的请求查询参数 (Query Parameters) 接口
export interface GetMessagesParams {
  conversation_id: string; // 会话 ID (必需)
  user: string; // 用户标识 (必需)
  first_id?: string | null; // 当前消息列表最上面 (最早) 那条消息的 ID，用于分页 (可选, 默认为 null)
  limit?: number; // 一次请求希望返回多少条聊天记录 (可选, 默认为 20)
}

// /messages API - 获取历史消息的响应体结构
export interface GetMessagesResponse {
  data: ConversationMessage[]; // 本次请求获取到的消息对象列表
  has_more: boolean; // 是否还有更早的聊天记录可以加载
  limit: number; // 本次请求实际返回的聊天记录条数
}
/**
 * Conversations API Type Definitions
 * @description Type definitions for Dify conversations API endpoints
 */
// /conversations API - 获取会话列表的参数
export interface GetConversationsParams {
  user: string; // 用户标识，必需
  last_id?: string | null; // 当前页最后一条记录的ID，用于分页，选填
  limit?: number; // 一次返回多少条记录，默认20，选填
  sort_by?: 'created_at' | '-created_at' | 'updated_at' | '-updated_at'; // 排序字段，默认-updated_at
}

// /conversations API - 单个会话对象结构
export interface Conversation {
  id: string; // 会话ID
  name: string; // 会话名称，默认由大语言模型生成
  inputs: Record<string, any>; // 用户输入参数
  status: string; // 会话状态
  introduction: string; // 开场白
  created_at: number; // 创建时间(时间戳)
  updated_at: number; // 更新时间(时间戳)
}

// /conversations API - 获取会话列表的响应体结构
export interface GetConversationsResponse {
  data: Conversation[]; // 会话列表
  has_more: boolean; // 是否有更多会话
  limit: number; // 返回条数
}
// /conversations API - 删除会话的请求体结构
export interface DeleteConversationRequestPayload {
  user: string; // 用户标识，由开发者定义规则，需保证用户标识在应用内唯一
}

// /conversations API - 删除会话的响应体结构
export interface DeleteConversationResponse {
  result: 'success';
}

// /conversations API - 重命名会话的请求体结构
export interface RenameConversationRequestPayload {
  name?: string; // （选填）名称，若 auto_generate 为 true 时，该参数可不传
  auto_generate?: boolean; // （选填）自动生成标题，默认 false
  user: string; // 用户标识，由开发者定义规则，需保证用户标识在应用内唯一
}

// /conversations API - 重命名会话的响应体结构，返回更新后的会话信息
export interface RenameConversationResponse extends Conversation {
  // 继承了 Conversation 接口的所有字段
}

// /conversations API - 获取对话变量的请求参数
export interface GetConversationVariablesParams {
  user: string; // 用户标识符，由开发人员定义的规则，在应用程序内必须唯一
  last_id?: string | null; // （选填）当前页最后面一条记录的 ID，默认 null
  limit?: number; // （选填）一次请求返回多少条记录，默认 20 条，最大 100 条，最小 1 条
}

// /conversations API - 对话变量对象结构
export interface ConversationVariable {
  id: string; // 变量 ID
  name: string; // 变量名称
  value_type: string; // 变量类型（字符串、数字、布尔等）
  value: string; // 变量值
  description: string; // 变量描述
  created_at: number; // 创建时间戳
  updated_at: number; // 最后更新时间戳
}

// /conversations API - 获取对话变量的响应体结构
export interface GetConversationVariablesResponse {
  limit: number; // 每页项目数
  has_more: boolean; // 是否有更多项目
  data: ConversationVariable[]; // 变量列表
}

// End of Conversations API types

// 应用参数相关类型定义 (GET /parameters)
/**
 * Dify 数字输入控件
 * @description 用于表单中的数字输入控件
 */
export interface DifyNumberInputControl {
  label: string; // 控件展示标签名
  variable: string; // 控件 ID
  required: boolean; // 是否必填
  default: number | string; // 默认值（可以是数字或字符串）
  min?: number; // 最小值限制
  max?: number; // 最大值限制
  step?: number; // 步长，默认为1
  precision?: number; // 小数位数限制
}

/**
 * Dify 文本输入控件
 * @description 用于表单中的文本输入控件
 */
export interface DifyTextInputControl {
  label: string; // 控件展示标签名
  variable: string; // 控件 ID
  required: boolean; // 是否必填
  max_length?: number; // 最大长度限制
  default: string; // 默认值
}

/**
 * 用户输入表单控件 - 段落文本输入
 * @description 用于表单中的段落文本输入控件
 */
export interface DifyParagraphControl {
  label: string; // 控件展示标签名
  variable: string; // 控件 ID
  required: boolean; // 是否必填
  default: string; // 默认值
}

/**
 * 用户输入表单控件 - 下拉选择
 * @description 用于表单中的下拉选择控件
 */
export interface DifySelectControl {
  label: string; // 控件展示标签名
  variable: string; // 控件 ID
  required: boolean; // 是否必填
  default: string; // 默认值
  options: string[]; // 选项值列表
}

/**
 * 文件输入控件
 * @description 用于表单中的文件输入控件
 */
export interface DifyFileInputControl {
  label: string; // 控件展示标签名
  variable: string; // 控件 ID
  required: boolean; // 是否必填
  default?: File[]; // 默认值（文件数组）
  number_limits?: number; // 文件数量限制
  allowed_file_types?: string[]; // 允许的文件类型
  max_file_size_mb?: number; // 最大文件大小(MB)
}

/**
 * 用户输入表单项
 * @description 用于表单中的用户输入项
 */
export interface DifyUserInputFormItem {
  'text-input'?: DifyTextInputControl;
  number?: DifyNumberInputControl;
  paragraph?: DifyParagraphControl;
  select?: DifySelectControl;
  file?: DifyFileInputControl;
  'file-list'?: DifyFileInputControl; // 多文件模式
}

/**
 * 图片上传配置
 * @description 用于配置图片上传相关的设置
 */
export interface DifyImageUploadConfig {
  enabled: boolean; // 是否开启
  number_limits: number; // 图片数量限制，默认 3
  transfer_methods: ('remote_url' | 'local_file')[]; // 传递方式列表，必选一个
}

/**
 * 文档上传配置
 * @description 用于配置文档上传相关的设置
 */
export interface DifyDocumentUploadConfig {
  enabled: boolean; // 是否开启
  number_limits: number; // 文档数量限制
  transfer_methods: ('remote_url' | 'local_file')[]; // 传递方式列表
}

/**
 * 音频上传配置
 * @description 用于配置音频上传相关的设置
 */
export interface DifyAudioUploadConfig {
  enabled: boolean; // 是否开启
  number_limits: number; // 音频数量限制
  transfer_methods: ('remote_url' | 'local_file')[]; // 传递方式列表
}

/**
 * 视频上传配置
 * @description 用于配置视频上传相关的设置
 */
export interface DifyVideoUploadConfig {
  enabled: boolean; // 是否开启
  number_limits: number; // 视频数量限制
  transfer_methods: ('remote_url' | 'local_file')[]; // 传递方式列表
}

/**
 * 其他文件类型上传配置
 * @description 用于配置其他文件类型上传相关的设置
 */
export interface DifyOtherUploadConfig {
  enabled: boolean; // 是否开启
  number_limits: number; // 文件数量限制
  transfer_methods: ('remote_url' | 'local_file')[]; // 传递方式列表
  custom_extensions?: string[]; // 自定义文件扩展名列表
}

/**
 * 文件上传配置
 * @description 用于配置文件上传相关的设置
 */
export interface DifyFileUploadConfig {
  enabled?: boolean; // 顶层的文件上传总开关
  allowed_file_types?: string[]; // 允许的文件类型列表
  allowed_file_extensions?: string[]; // 允许的文件扩展名列表
  allowed_file_upload_methods?: string[]; // 允许的上传方式
  max_file_size_mb?: number; // 最大文件大小(MB)
  number_limits?: number; // 文件数量限制（可能的字段名1）
  max_files?: number; // 文件数量限制（可能的字段名2）
  file_count_limit?: number; // 文件数量限制（可能的字段名3）
  image?: DifyImageUploadConfig; // 图片设置
  document?: DifyDocumentUploadConfig; // 文档设置
  audio?: DifyAudioUploadConfig; // 音频设置
  video?: DifyVideoUploadConfig; // 视频设置
  other?: DifyOtherUploadConfig; // 其他文件类型设置
}

/**
 * 系统参数配置
 * @description 用于配置系统相关的参数
 */
export interface DifySystemParameters {
  file_size_limit: number; // 文档上传大小限制 (MB)
  image_file_size_limit: number; // 图片文件上传大小限制 (MB)
  audio_file_size_limit: number; // 音频文件上传大小限制 (MB)
  video_file_size_limit: number; // 视频文件上传大小限制 (MB)
}

/**
 * 回答后推荐问题配置
 * @description 用于配置回答后推荐问题相关的设置
 */
export interface DifySuggestedQuestionsAfterAnswer {
  enabled: boolean; // 是否开启
}

/**
 * 语音转文本配置
 * @description 用于配置语音转文本相关的设置
 */
export interface DifySpeechToText {
  enabled: boolean; // 是否开启
}

/**
 * 文本转语音配置
 * @description 用于配置文本转语音相关的设置
 */
export interface DifyTextToSpeech {
  enabled: boolean; // 是否开启
  voice?: string; // 语音类型
  language?: string; // 语言
  autoPlay?: 'enabled' | 'disabled'; // 自动播放：enabled 开启, disabled 关闭
}

/**
 * 引用和归属配置
 * @description 用于配置引用和归属相关的设置
 */
export interface DifyRetrieverResourceConfig {
  enabled: boolean; // 是否开启
}

/**
 * 标记回复配置
 * @description 用于配置标记回复相关的设置
 */
export interface DifyAnnotationReply {
  enabled: boolean; // 是否开启
}

/**
 * 获取应用参数响应
 * @description 用于返回应用相关的参数
 */
export interface DifyAppParametersResponse {
  opening_statement: string; // 开场白
  suggested_questions: string[]; // 开场推荐问题列表
  suggested_questions_after_answer: DifySuggestedQuestionsAfterAnswer; // 启用回答后给出推荐问题
  speech_to_text: DifySpeechToText; // 语音转文本
  text_to_speech: DifyTextToSpeech; // 文本转语音
  retriever_resource: DifyRetrieverResourceConfig; // 引用和归属
  annotation_reply: DifyAnnotationReply; // 标记回复
  user_input_form: DifyUserInputFormItem[]; // 用户输入表单配置
  file_upload: DifyFileUploadConfig; // 文件上传配置
  system_parameters: DifySystemParameters; // 系统参数
}

// Workflow API 相关类型定义
// POST /workflows/run
// 基于完整的 OpenAPI 文档更新
/**
 * Workflow 输入文件对象
 * @description 用于描述工作流输入文件的结构
 */
export interface DifyWorkflowInputFile {
  type: 'document' | 'image' | 'audio' | 'video' | 'custom';
  transfer_method: 'remote_url' | 'local_file';
  url?: string; // transfer_method 为 remote_url 时必需
  upload_file_id?: string; // transfer_method 为 local_file 时必需
}

/**
 * Dify Workflow 请求体
 * @description 用于描述工作流请求的结构
 */
export interface DifyWorkflowRequestPayload {
  inputs: Record<string, any>; // 结构化输入参数，支持字符串、数字、布尔值、对象、文件数组
  response_mode: 'streaming' | 'blocking';
  user: string;
  // 注意：Workflow 没有 conversation_id 概念
}

/**
 * Dify Workflow 执行响应 (blocking模式)
 * @description 用于描述工作流执行响应的结构
 */
export interface DifyWorkflowCompletionResponse {
  workflow_run_id: string; // UUID 格式
  task_id: string; // UUID 格式
  data: DifyWorkflowFinishedData;
}

/**
 * Workflow 执行完成数据
 * @description 用于描述工作流执行完成的数据结构
 */
export interface DifyWorkflowFinishedData {
  id: string; // workflow 执行 ID (UUID)
  workflow_id: string; // 关联 Workflow ID (UUID)
  status: 'running' | 'succeeded' | 'failed' | 'stopped';
  outputs?: Record<string, any> | null; // 结构化输出 (JSON)
  error?: string | null;
  elapsed_time?: number | null; // 耗时(秒)
  total_tokens?: number | null;
  total_steps: number; // 总步数，默认 0
  created_at: number; // 开始时间 (Unix timestamp)
  finished_at: number; // 结束时间 (Unix timestamp)
}

/**
 * Workflow SSE 事件 - workflow_started
 * @description event: workflow_started - 工作流执行开始
 */
export interface DifyWorkflowSseStartedEvent {
  event: 'workflow_started';
  task_id: string;
  workflow_run_id: string;
  data: {
    id: string;
    workflow_id: string;
    sequence_number: number;
    created_at: number;
  };
}

/**
 * Workflow SSE 事件 - workflow_finished
 * @description event: workflow_finished - 工作流执行完成
 */
export interface DifyWorkflowSseFinishedEvent {
  event: 'workflow_finished';
  task_id: string;
  workflow_run_id: string;
  data: DifyWorkflowFinishedData;
}

/**
 * Workflow SSE 事件 - node_started
 * @description event: node_started - 工作流节点开始执行
 */
export interface DifyWorkflowSseNodeStartedEvent {
  event: 'node_started';
  task_id: string;
  workflow_run_id: string;
  data: {
    id: string;
    node_id: string;
    node_type: string;
    title: string;
    index: number;
    predecessor_node_id?: string;
    inputs: Record<string, any>;
    created_at: number;
  };
}

/**
 * Workflow SSE 事件 - node_finished
 * @description event: node_finished - 工作流节点执行完成
 */
export interface DifyWorkflowSseNodeFinishedEvent {
  event: 'node_finished';
  task_id: string;
  workflow_run_id: string;
  data: {
    id: string;
    node_id: string;
    index: number;
    predecessor_node_id?: string;
    inputs?: Record<string, any>;
    process_data?: any;
    outputs?: any;
    status: 'running' | 'succeeded' | 'failed' | 'stopped';
    error?: string;
    elapsed_time?: number;
    execution_metadata?: any;
    total_tokens?: number;
    total_price?: string;
    currency?: string;
    created_at: number;
  };
}

/**
 * Workflow SSE 事件 - error
 * @description event: error - SSE流处理错误
 */
export interface DifyWorkflowSseErrorEvent {
  event: 'error';
  task_id: string;
  workflow_run_id?: string;
  status: number;
  code: string;
  message: string;
}

/**
 * 所有 Workflow SSE 事件的联合类型
 * @description 用于描述所有可能的 Workflow SSE 事件的联合类型
 */
export type DifyWorkflowSseEvent =
  | DifyWorkflowSseStartedEvent
  | DifyWorkflowSseFinishedEvent
  | DifyWorkflowSseNodeStartedEvent
  | DifyWorkflowSseNodeFinishedEvent
  | DifyWorkflowSseErrorEvent
  | DifySseIterationStartedEvent
  | DifySseIterationNextEvent
  | DifySseIterationCompletedEvent
  | DifySseLoopStartedEvent
  | DifySseLoopNextEvent
  | DifySseLoopCompletedEvent;

/**
 * Workflow 流式响应接口
 * @description 用于描述工作流流式响应的接口
 */
export interface DifyWorkflowStreamResponse {
  // 🎯 修复：节点执行进度流，支持所有 workflow 事件类型
  progressStream: AsyncGenerator<DifyWorkflowSseEvent, void, undefined>;

  // 获取 workflow_run_id
  getWorkflowRunId: () => string | null;

  // 获取 task_id
  getTaskId: () => string | null;

  // 完成时的 Promise，包含最终结果
  completionPromise: Promise<DifyWorkflowFinishedData>;
}

/**
 * Workflow API 错误码
 * @description 用于描述工作流 API 可能出现的错误码
 */
export type DifyWorkflowErrorCode =
  | 'invalid_param'
  | 'app_unavailable'
  | 'provider_not_initialize'
  | 'provider_quota_exceeded'
  | 'model_currently_not_support'
  | 'workflow_request_error';

// 获取应用基本信息 API 类型定义
// GET /info
/**
 * 获取应用基本信息响应
 * @description 用于返回应用的基本信息
 */
export interface DifyAppInfoResponse {
  name: string; // 应用名称
  description: string; // 应用描述
  tags: string[]; // 应用标签
}

// 消息反馈 API 类型定义
// POST /messages/:message_id/feedbacks
/**
 * 消息反馈请求体
 * @description 用于描述消息反馈请求的结构
 */
export interface DifyMessageFeedbackRequestPayload {
  rating: 'like' | 'dislike' | null; // 反馈类型：点赞 'like'、点踩 'dislike'、撤销 'null'
  user: string; // 用户标识符
  content?: string; // 消息反馈的具体信息（可选）
}

/**
 * 消息反馈响应体
 * @description 用于返回消息反馈响应的结构
 */
export interface DifyMessageFeedbackResponse {
  result: 'success'; // 固定返回 success
}

// 语音转文本 API 类型定义
// POST /audio-to-text
/**
 * 语音转文本请求体
 * @description 用于描述语音转文本请求的结构
 */
export interface DifyAudioToTextRequestPayload {
  file: File; // 音频文件
  user: string; // 用户标识符
}

/**
 * 语音转文本响应体
 * @description 用于返回语音转文本响应的结构
 */
export interface DifyAudioToTextResponse {
  text: string; // 转换后的文本
}

// Text-Generation API 类型定义
// POST /completion-messages
/**
 * 文本生成请求体
 * @description 用于描述文本生成请求的结构
 */
export interface DifyCompletionRequestPayload {
  inputs: Record<string, any>; // 输入参数
  response_mode: 'streaming' | 'blocking'; // 响应模式
  user: string; // 用户标识符
  files?: DifyFile[]; // 文件列表（可选）
}

/**
 * 文本生成完成响应 (blocking模式)
 * @description 用于描述文本生成完成响应的结构
 */
export interface DifyCompletionResponse {
  message_id: string; // 消息 ID
  mode: string; // App 模式，固定为 "completion"
  answer: string; // 生成的文本
  metadata: Record<string, any>; // 元数据
  usage: DifyUsage; // 使用量信息
  created_at: number; // 创建时间戳
}

/**
 * 文本生成流式响应接口
 * @description 用于描述文本生成流式响应的接口
 */
export interface DifyCompletionStreamResponse {
  // 文本块流
  answerStream: AsyncGenerator<string, void, undefined>;

  // 获取消息 ID
  getMessageId: () => string | null;

  // 获取任务 ID
  getTaskId: () => string | null;

  // 完成时的 Promise
  completionPromise: Promise<{
    usage?: DifyUsage;
    metadata?: Record<string, any>;
  }>;
}

// WebApp 设置 API 类型定义
// GET /site
/**
 * WebApp 设置响应
 * @description 用于返回WebApp设置的响应
 */
export interface DifyWebAppSettingsResponse {
  title: string; // WebApp 名称
  chat_color_theme: string; // 聊天颜色主题, hex 格式
  chat_color_theme_inverted: boolean; // 聊天颜色主题是否反转
  icon_type: 'emoji' | 'image'; // 图标类型
  icon: string; // 图标内容 (emoji 或图片 URL)
  icon_background: string; // hex 格式的背景色
  icon_url: string | null; // 图标 URL
  description: string; // 描述
  copyright: string; // 版权信息
  privacy_policy: string; // 隐私政策链接
  custom_disclaimer: string; // 自定义免责声明
  default_language: string; // 默认语言
  show_workflow_steps: boolean; // 是否显示工作流详情
  use_icon_as_answer_icon: boolean; // 是否使用 WebApp 图标替换聊天中的机器人图标
}

// 应用 Meta 信息 API 类型定义
// GET /meta
/**
 * 工具图标详情
 * @description 用于描述工具图标的结构
 */
export interface DifyToolIconDetail {
  background: string; // hex 格式的背景色
  content: string; // emoji
}

/**
 * 应用 Meta 信息响应
 * @description 用于返回应用的Meta信息
 */
export interface DifyAppMetaResponse {
  tool_icons: Record<string, string | DifyToolIconDetail>; // 工具图标，键为工具名称，值为图标 URL 或详情对象
}

/**
 * Workflow 执行详情响应
 * @description 用于返回工作流执行详情响应的结构
 */
export interface DifyWorkflowRunDetailResponse {
  id: string; // workflow 执行 ID (UUID)
  workflow_id: string; // 关联的 Workflow ID (UUID)
  status: 'running' | 'succeeded' | 'failed' | 'stopped'; // 执行状态
  inputs: string; // 任务输入内容的 JSON 字符串
  outputs: Record<string, any> | null; // 任务输出内容的 JSON 对象
  error: string | null; // 错误原因
  total_steps: number; // 任务执行总步数
  total_tokens: number; // 任务执行总 tokens
  created_at: number; // 任务开始时间 (Unix timestamp)
  finished_at: number | null; // 任务结束时间 (Unix timestamp)
  elapsed_time: number | null; // 耗时(秒)
}

// Workflow 日志 API 类型定义
// GET /workflows/logs
/**
 * Workflow 执行状态枚举
 * @description 用于描述工作流执行状态的枚举类型
 */
export type DifyWorkflowLogStatus =
  | 'succeeded'
  | 'failed'
  | 'stopped'
  | 'running';

/**
 * 获取 Workflow 日志的请求参数
 * @description 用于描述获取工作流日志请求的参数结构
 */
export interface GetDifyWorkflowLogsParams {
  keyword?: string; // 关键字（可选）
  status?: DifyWorkflowLogStatus; // 执行状态（可选）
  page?: number; // 当前页码，默认 1
  limit?: number; // 每页条数，默认 20
}

/**
 * Workflow 日志单条记录
 * @description 用于描述工作流日志单条记录的结构
 */
export interface DifyWorkflowLogEntry {
  id: string; // workflow 执行 ID (UUID)
  workflow_id: string; // 关联的 Workflow ID (UUID)
  status: DifyWorkflowLogStatus; // 执行状态
  inputs: string; // 任务输入内容的 JSON 字符串
  outputs: Record<string, any> | null; // 任务输出内容的 JSON 对象
  error: string | null; // 错误原因
  total_steps: number; // 任务执行总步数
  total_tokens: number; // 任务执行总 tokens
  created_at: number; // 任务开始时间 (Unix timestamp)
  finished_at: number | null; // 任务结束时间 (Unix timestamp)
  elapsed_time: number | null; // 耗时(秒)
}

/**
 * 获取 Workflow 日志的响应体
 * @description 用于返回获取工作流日志响应的结构
 */
export interface GetDifyWorkflowLogsResponse {
  page: number; // 当前页码
  limit: number; // 每页条数
  total: number; // 总条数
  has_more: boolean; // 是否还有更多数据
  data: DifyWorkflowLogEntry[]; // 当前页码的数据
}

// 标注列表 API 类型定义
// GET /apps/annotations
/**
 * 单个标注条目
 * @description 用于描述单个标注条目的结构
 */
export interface DifyAnnotationItem {
  id: string; // 标注ID (UUID格式)
  question: string; // 问题
  answer: string; // 答案内容
  hit_count: number; // 命中次数
  created_at: number; // 创建时间戳
}

/**
 * 获取标注列表的请求参数
 * @description 用于描述获取标注列表请求的参数结构
 */
export interface GetDifyAnnotationsParams {
  page?: number; // 分页页码，默认：1
  limit?: number; // 每页数量，默认 20，范围 1-100
}

/**
 * 标注列表响应
 * @description 用于返回标注列表响应的结构
 */
export interface DifyAnnotationListResponse {
  data: DifyAnnotationItem[]; // 标注列表
  has_more: boolean; // 是否有更多数据
  limit: number; // 每页数量
  total: number; // 总数量
  page: number; // 当前页码
}

// 创建标注 API 类型定义
// POST /apps/annotations
/**
 * 创建标注请求体
 * @description 用于描述创建标注请求的结构
 */
export interface CreateDifyAnnotationRequest {
  question: string; // 问题
  answer: string; // 答案内容
}

/**
 * 创建标注响应 (返回创建的标注条目)
 * @description 用于返回创建标注响应的结构
 */
export interface CreateDifyAnnotationResponse extends DifyAnnotationItem {
  // 继承 DifyAnnotationItem 的所有字段
}

// 更新标注 API 类型定义
// PUT /apps/annotations/{annotation_id}
/**
 * 更新标注请求体
 * @description 用于描述更新标注请求的结构
 */
export interface UpdateDifyAnnotationRequest {
  question: string; // 问题
  answer: string; // 答案内容
}

/**
 * 更新标注响应 (返回更新后的标注条目)
 * @description 用于返回更新标注响应的结构
 */
export interface UpdateDifyAnnotationResponse extends DifyAnnotationItem {
  // 继承 DifyAnnotationItem 的所有字段
}

// 删除标注 API 类型定义
// DELETE /apps/annotations/{annotation_id}
// 删除成功返回 204 状态码，无响应体
/**
 * 删除标注响应 (204 状态码，无内容)
 * @description 用于描述删除标注响应的结构
 */
export interface DeleteDifyAnnotationResponse {
  // 空接口，表示无响应体
}

// 标注回复初始设置 API 类型定义
// POST /apps/annotation-reply/{action}
/**
 * 标注回复设置动作类型
 * @description 用于描述标注回复设置动作类型的枚举类型
 */
export type DifyAnnotationReplyAction = 'enable' | 'disable';

/**
 * 标注回复初始设置请求体
 * @description 用于描述标注回复初始设置请求的结构
 */
export interface InitialDifyAnnotationReplySettingsRequest {
  embedding_provider_name?: string | null; // （可选）指定的嵌入模型提供商名称
  embedding_model_name?: string | null; // （可选）指定的嵌入模型名称
  score_threshold: number; // 相似度阈值
}

/**
 * 异步任务响应
 * @description 用于描述异步任务响应的结构
 */
export interface DifyAsyncJobResponse {
  job_id: string; // 任务 ID (UUID格式)
  job_status: string; // 任务状态
}

/**
 * 异步任务状态响应
 * @description 用于描述异步任务状态响应的结构
 */
export interface DifyAsyncJobStatusResponse {
  job_id: string; // 任务 ID (UUID格式)
  job_status: string; // 任务状态
  error_msg?: string | null; // 错误信息（如果任务失败）
}

// 所有可能的 SSE 事件联合类型
export type DifySseEvent =
  | DifySseMessageEvent
  | DifySseMessageFileEvent
  | DifySseMessageEndEvent
  | DifySseTtsMessageEvent
  | DifySseTtsMessageEndEvent
  | DifySseMessageReplaceEvent
  | DifySseWorkflowStartedEvent
  | DifySseNodeStartedEvent
  | DifySseNodeFinishedEvent
  | DifySseWorkflowFinishedEvent
  | DifySseIterationStartedEvent
  | DifySseIterationNextEvent
  | DifySseIterationCompletedEvent
  | DifySseParallelBranchStartedEvent
  | DifySseParallelBranchFinishedEvent
  | DifySseLoopStartedEvent
  | DifySseLoopNextEvent
  | DifySseLoopCompletedEvent
  | DifySseErrorEvent
  | DifySsePingEvent
  | DifySseAgentThoughtEvent
  | DifySseAgentMessageEvent;
