// 链表节点类型
export interface ListNode {
  val: number;
  next: ListNode | null;
  id: string; // 用于动画追踪
}

// 可视化节点类型
export interface VisualNode {
  id: string;
  val: number;
  x: number;
  y: number;
  listIndex: number; // 属于哪个链表
  nodeIndex: number; // 在链表中的位置
  isHighlighted: boolean;
  isProcessed: boolean;
  isCurrent: boolean;
  isMergingA?: boolean; // 是否是正在合并的A链表（ans链表）的节点
  isMergingB?: boolean; // 是否是正在合并的B链表（当前链表）的节点
  isPending?: boolean;  // 是否是待处理的链表（未参与合并）
  label?: string;
}

// 可视化边类型
export interface VisualEdge {
  id: string;
  source: string;
  target: string;
  isHighlighted: boolean;
  label?: string;
}

// 算法步骤类型
export interface AlgorithmStep {
  id: number;
  description: string;
  nodes: VisualNode[];
  edges: VisualEdge[];
  resultNodes: VisualNode[];
  resultEdges: VisualEdge[];
  highlightedLines: {
    java: number[];
    python: number[];
    golang: number[];
    javascript: number[];
  };
  variables: Record<string, string>;
  annotations: Annotation[];
}

// 标注类型
export interface Annotation {
  id: string;
  text: string;
  x: number;
  y: number;
  targetNodeId?: string;
  type: 'info' | 'compare' | 'move' | 'result';
}

// 算法类型
export type AlgorithmType = 'sequential' | 'divideConquer' | 'priorityQueue';

// 代码语言类型
export type CodeLanguage = 'java' | 'python' | 'golang' | 'javascript';

// 播放状态
export interface PlaybackState {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
}

// 输入数据类型
export interface InputData {
  lists: number[][];
  isValid: boolean;
  errorMessage?: string;
}
