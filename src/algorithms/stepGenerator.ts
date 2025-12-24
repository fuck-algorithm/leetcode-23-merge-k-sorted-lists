import type { AlgorithmStep, AlgorithmType, VisualNode, VisualEdge } from '../types';

// const COLORS = {
//   default: '#4A90A4',
//   highlighted: '#E67E22',
//   processed: '#27AE60',
//   current: '#E74C3C',
//   result: '#2ECC71',
// };

// 生成唯一ID
let idCounter = 0;
function generateId(): string {
  return `node-${++idCounter}`;
}

// 重置ID计数器
function resetIdCounter(): void {
  idCounter = 0;
}

// 创建可视化节点
function createVisualNode(
  val: number,
  listIndex: number,
  nodeIndex: number,
  x: number,
  y: number,
  options: Partial<VisualNode> = {}
): VisualNode {
  return {
    id: generateId(),
    val,
    x,
    y,
    listIndex,
    nodeIndex,
    isHighlighted: false,
    isProcessed: false,
    isCurrent: false,
    ...options,
  };
}

// 创建可视化边
function createVisualEdge(
  source: string,
  target: string,
  options: Partial<VisualEdge> = {}
): VisualEdge {
  return {
    id: `edge-${source}-${target}`,
    source,
    target,
    isHighlighted: false,
    ...options,
  };
}

// 计算链表布局
function calculateListLayout(
  lists: number[][],
  startX: number,
  startY: number,
  nodeSpacing: number,
  listSpacing: number
): { nodes: VisualNode[]; edges: VisualEdge[] } {
  const nodes: VisualNode[] = [];
  const edges: VisualEdge[] = [];
  
  lists.forEach((list, listIndex) => {
    let prevNode: VisualNode | null = null;
    
    list.forEach((val, nodeIndex) => {
      const x = startX + nodeIndex * nodeSpacing;
      const y = startY + listIndex * listSpacing;
      const node = createVisualNode(val, listIndex, nodeIndex, x, y);
      nodes.push(node);
      
      if (prevNode) {
        edges.push(createVisualEdge(prevNode.id, node.id));
      }
      prevNode = node;
    });
  });
  
  return { nodes, edges };
}

// 顺序合并步骤生成
export function generateSequentialSteps(lists: number[][]): AlgorithmStep[] {
  resetIdCounter();
  const steps: AlgorithmStep[] = [];
  
  if (lists.length === 0 || lists.every(l => l.length === 0)) {
    steps.push({
      id: 0,
      description: '输入为空，返回空链表',
      nodes: [],
      edges: [],
      resultNodes: [],
      resultEdges: [],
      highlightedLines: { java: [3, 4], python: [3, 4], golang: [3, 4], javascript: [3, 4] },
      variables: { ans: 'null' },
      annotations: [],
    });
    return steps;
  }
  
  const { nodes: initialNodes, edges: initialEdges } = calculateListLayout(lists, 100, 80, 80, 100);
  
  // 初始状态
  steps.push({
    id: steps.length,
    description: '初始化：准备合并 ' + lists.length + ' 个升序链表',
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: [],
    resultEdges: [],
    highlightedLines: { java: [3], python: [3], golang: [3], javascript: [2] },
    variables: { ans: 'null', i: '0' },
    annotations: [{
      id: 'init',
      text: '开始顺序合并',
      x: 50,
      y: 30,
      type: 'info',
    }],
  });
  
  // 模拟合并过程
  let result: number[] = [];
  const processedLists: number[][] = [];
  
  for (let i = 0; i < lists.length; i++) {
    const currentList = lists[i];
    processedLists.push(currentList);
    
    // 合并前状态
    const beforeNodes = JSON.parse(JSON.stringify(initialNodes));
    beforeNodes.forEach((node: VisualNode) => {
      if (node.listIndex === i) {
        node.isHighlighted = true;
      } else if (node.listIndex < i) {
        node.isProcessed = true;
      }
    });
    
    steps.push({
      id: steps.length,
      description: `第 ${i + 1} 轮：准备合并第 ${i + 1} 个链表 [${currentList.join(', ')}]`,
      nodes: beforeNodes,
      edges: JSON.parse(JSON.stringify(initialEdges)),
      resultNodes: createResultNodes(result, 100, 400),
      resultEdges: createResultEdges(result.length),
      highlightedLines: { java: [4, 5], python: [4, 5], golang: [4, 5], javascript: [3, 4] },
      variables: { ans: result.length > 0 ? `[${result.join(', ')}]` : 'null', i: String(i) },
      annotations: [{
        id: `merge-${i}`,
        text: `合并第 ${i + 1} 个链表`,
        x: 100 + currentList.length * 40,
        y: 80 + i * 100 - 20,
        type: 'info',
      }],
    });
    
    // 执行合并
    const merged: number[] = [];
    let p1 = 0, p2 = 0;
    
    while (p1 < result.length && p2 < currentList.length) {
      const mergeNodes = JSON.parse(JSON.stringify(initialNodes));
      mergeNodes.forEach((node: VisualNode) => {
        if (node.listIndex < i) {
          node.isProcessed = true;
        }
      });
      
      if (result[p1] <= currentList[p2]) {
        merged.push(result[p1]);
        
        steps.push({
          id: steps.length,
          description: `比较 ${result[p1]} 和 ${currentList[p2]}，选择较小的 ${result[p1]}`,
          nodes: mergeNodes,
          edges: JSON.parse(JSON.stringify(initialEdges)),
          resultNodes: createResultNodes([...merged], 100, 400, merged.length - 1),
          resultEdges: createResultEdges(merged.length),
          highlightedLines: { java: [16, 17, 18], python: [14, 15, 16], golang: [16, 17, 18], javascript: [14, 15, 16] },
          variables: { 
            'aPtr.val': String(result[p1]), 
            'bPtr.val': String(currentList[p2]),
            'merged': `[${merged.join(', ')}]`
          },
          annotations: [{
            id: `compare-${steps.length}`,
            text: `${result[p1]} ≤ ${currentList[p2]}`,
            x: 300,
            y: 350,
            type: 'compare',
          }],
        });
        
        p1++;
      } else {
        merged.push(currentList[p2]);
        
        steps.push({
          id: steps.length,
          description: `比较 ${result[p1]} 和 ${currentList[p2]}，选择较小的 ${currentList[p2]}`,
          nodes: mergeNodes,
          edges: JSON.parse(JSON.stringify(initialEdges)),
          resultNodes: createResultNodes([...merged], 100, 400, merged.length - 1),
          resultEdges: createResultEdges(merged.length),
          highlightedLines: { java: [19, 20, 21], python: [17, 18, 19], golang: [19, 20, 21], javascript: [17, 18, 19] },
          variables: { 
            'aPtr.val': String(result[p1]), 
            'bPtr.val': String(currentList[p2]),
            'merged': `[${merged.join(', ')}]`
          },
          annotations: [{
            id: `compare-${steps.length}`,
            text: `${result[p1]} > ${currentList[p2]}`,
            x: 300,
            y: 350,
            type: 'compare',
          }],
        });
        
        p2++;
      }
    }
    
    // 处理剩余元素
    while (p1 < result.length) {
      merged.push(result[p1++]);
    }
    while (p2 < currentList.length) {
      merged.push(currentList[p2++]);
    }
    
    if (p1 < result.length || p2 < currentList.length) {
      const remainingNodes = JSON.parse(JSON.stringify(initialNodes));
      remainingNodes.forEach((node: VisualNode) => {
        if (node.listIndex <= i) {
          node.isProcessed = true;
        }
      });
      
      steps.push({
        id: steps.length,
        description: '将剩余元素追加到结果链表',
        nodes: remainingNodes,
        edges: JSON.parse(JSON.stringify(initialEdges)),
        resultNodes: createResultNodes(merged, 100, 400),
        resultEdges: createResultEdges(merged.length),
        highlightedLines: { java: [24], python: [21], golang: [27, 28, 29, 30, 31], javascript: [22] },
        variables: { 'merged': `[${merged.join(', ')}]` },
        annotations: [],
      });
    }
    
    result = merged;
  }
  
  // 最终结果
  const finalNodes = JSON.parse(JSON.stringify(initialNodes));
  finalNodes.forEach((node: VisualNode) => {
    node.isProcessed = true;
  });
  
  steps.push({
    id: steps.length,
    description: `合并完成！结果链表：[${result.join(' → ')}]`,
    nodes: finalNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: createResultNodes(result, 100, 400),
    resultEdges: createResultEdges(result.length),
    highlightedLines: { java: [6], python: [6], golang: [6], javascript: [5] },
    variables: { 'result': `[${result.join(', ')}]` },
    annotations: [{
      id: 'complete',
      text: '合并完成！',
      x: 100 + result.length * 40,
      y: 380,
      type: 'result',
    }],
  });
  
  return steps;
}

// 创建结果链表节点
function createResultNodes(values: number[], startX: number, y: number, highlightIndex?: number): VisualNode[] {
  return values.map((val, index) => ({
    id: `result-${index}`,
    val,
    x: startX + index * 70,
    y,
    listIndex: -1,
    nodeIndex: index,
    isHighlighted: index === highlightIndex,
    isProcessed: false,
    isCurrent: index === highlightIndex,
  }));
}

// 创建结果链表边
function createResultEdges(length: number): VisualEdge[] {
  const edges: VisualEdge[] = [];
  for (let i = 0; i < length - 1; i++) {
    edges.push({
      id: `result-edge-${i}`,
      source: `result-${i}`,
      target: `result-${i + 1}`,
      isHighlighted: false,
    });
  }
  return edges;
}

// 分治合并步骤生成
export function generateDivideConquerSteps(lists: number[][]): AlgorithmStep[] {
  resetIdCounter();
  const steps: AlgorithmStep[] = [];
  
  if (lists.length === 0 || lists.every(l => l.length === 0)) {
    steps.push({
      id: 0,
      description: '输入为空，返回空链表',
      nodes: [],
      edges: [],
      resultNodes: [],
      resultEdges: [],
      highlightedLines: { java: [3], python: [3, 4], golang: [2], javascript: [2] },
      variables: {},
      annotations: [],
    });
    return steps;
  }
  
  const { nodes: initialNodes, edges: initialEdges } = calculateListLayout(lists, 100, 80, 80, 100);
  
  // 初始状态
  steps.push({
    id: steps.length,
    description: '初始化：使用分治法合并 ' + lists.length + ' 个升序链表',
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: [],
    resultEdges: [],
    highlightedLines: { java: [2, 3], python: [2, 3], golang: [2], javascript: [2] },
    variables: { l: '0', r: String(lists.length - 1) },
    annotations: [{
      id: 'init',
      text: '分治合并开始',
      x: 50,
      y: 30,
      type: 'info',
    }],
  });
  
  // 递归分治过程
  const result = divideConquerRecursive(lists, 0, lists.length - 1, steps, initialNodes, initialEdges, 0);
  
  // 最终结果
  const finalNodes = JSON.parse(JSON.stringify(initialNodes));
  finalNodes.forEach((node: VisualNode) => {
    node.isProcessed = true;
  });
  
  steps.push({
    id: steps.length,
    description: `分治合并完成！结果链表：[${result.join(' → ')}]`,
    nodes: finalNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: createResultNodes(result, 100, 400),
    resultEdges: createResultEdges(result.length),
    highlightedLines: { java: [3], python: [5], golang: [2], javascript: [2] },
    variables: { 'result': `[${result.join(', ')}]` },
    annotations: [{
      id: 'complete',
      text: '分治合并完成！',
      x: 100 + result.length * 40,
      y: 380,
      type: 'result',
    }],
  });
  
  return steps;
}

function divideConquerRecursive(
  lists: number[][],
  l: number,
  r: number,
  steps: AlgorithmStep[],
  initialNodes: VisualNode[],
  initialEdges: VisualEdge[],
  depth: number
): number[] {
  if (l > r) return [];
  if (l === r) {
    const nodes = JSON.parse(JSON.stringify(initialNodes));
    nodes.forEach((node: VisualNode) => {
      if (node.listIndex === l) {
        node.isHighlighted = true;
      }
    });
    
    steps.push({
      id: steps.length,
      description: `递归到达叶子节点：返回第 ${l + 1} 个链表 [${lists[l].join(', ')}]`,
      nodes,
      edges: JSON.parse(JSON.stringify(initialEdges)),
      resultNodes: [],
      resultEdges: [],
      highlightedLines: { java: [6], python: [8], golang: [5], javascript: [3] },
      variables: { l: String(l), r: String(r), depth: String(depth) },
      annotations: [{
        id: `leaf-${l}`,
        text: `叶子节点`,
        x: 100,
        y: 80 + l * 100 - 20,
        type: 'info',
      }],
    });
    
    return lists[l];
  }
  
  const mid = Math.floor((l + r) / 2);
  
  // 分割步骤
  const splitNodes = JSON.parse(JSON.stringify(initialNodes));
  splitNodes.forEach((node: VisualNode) => {
    if (node.listIndex >= l && node.listIndex <= mid) {
      node.isHighlighted = true;
    } else if (node.listIndex > mid && node.listIndex <= r) {
      node.isCurrent = true;
    }
  });
  
  steps.push({
    id: steps.length,
    description: `分割：将链表 ${l + 1}-${r + 1} 分为 [${l + 1}-${mid + 1}] 和 [${mid + 2}-${r + 1}]`,
    nodes: splitNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: [],
    resultEdges: [],
    highlightedLines: { java: [7, 8, 9, 10, 11], python: [9, 10, 11, 12, 13], golang: [6, 7, 8, 9, 10], javascript: [4, 5, 6, 7, 8] },
    variables: { l: String(l), r: String(r), mid: String(mid), depth: String(depth) },
    annotations: [{
      id: `split-${l}-${r}`,
      text: `mid = ${mid}`,
      x: 400,
      y: 80 + mid * 100,
      type: 'info',
    }],
  });
  
  // 递归左半部分
  const leftResult = divideConquerRecursive(lists, l, mid, steps, initialNodes, initialEdges, depth + 1);
  
  // 递归右半部分
  const rightResult = divideConquerRecursive(lists, mid + 1, r, steps, initialNodes, initialEdges, depth + 1);
  
  // 合并步骤
  const merged = mergeTwoArrays(leftResult, rightResult);
  
  const mergeNodes = JSON.parse(JSON.stringify(initialNodes));
  mergeNodes.forEach((node: VisualNode) => {
    if (node.listIndex >= l && node.listIndex <= r) {
      node.isProcessed = true;
    }
  });
  
  steps.push({
    id: steps.length,
    description: `合并：[${leftResult.join(', ')}] + [${rightResult.join(', ')}] = [${merged.join(', ')}]`,
    nodes: mergeNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: createResultNodes(merged, 100, 350 + depth * 50),
    resultEdges: createResultEdges(merged.length),
    highlightedLines: { java: [8, 9, 10, 11], python: [10, 11, 12, 13], golang: [7, 8, 9, 10], javascript: [5, 6, 7, 8] },
    variables: { 
      left: `[${leftResult.join(', ')}]`,
      right: `[${rightResult.join(', ')}]`,
      merged: `[${merged.join(', ')}]`,
      depth: String(depth)
    },
    annotations: [{
      id: `merge-${l}-${r}`,
      text: `合并深度 ${depth}`,
      x: 100 + merged.length * 35,
      y: 330 + depth * 50,
      type: 'result',
    }],
  });
  
  return merged;
}

function mergeTwoArrays(a: number[], b: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) {
      result.push(a[i++]);
    } else {
      result.push(b[j++]);
    }
  }
  while (i < a.length) result.push(a[i++]);
  while (j < b.length) result.push(b[j++]);
  return result;
}

// 优先队列步骤生成
export function generatePriorityQueueSteps(lists: number[][]): AlgorithmStep[] {
  resetIdCounter();
  const steps: AlgorithmStep[] = [];
  
  if (lists.length === 0 || lists.every(l => l.length === 0)) {
    steps.push({
      id: 0,
      description: '输入为空，返回空链表',
      nodes: [],
      edges: [],
      resultNodes: [],
      resultEdges: [],
      highlightedLines: { java: [3, 4, 5, 6, 7], python: [4, 5, 6, 7], golang: [5, 6, 7, 8], javascript: [3, 4, 5] },
      variables: {},
      annotations: [],
    });
    return steps;
  }
  
  const { nodes: initialNodes, edges: initialEdges } = calculateListLayout(lists, 100, 80, 80, 100);
  
  // 初始状态
  steps.push({
    id: steps.length,
    description: '初始化：创建优先队列（最小堆）',
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: [],
    resultEdges: [],
    highlightedLines: { java: [3, 4, 5], python: [4], golang: [5], javascript: [3] },
    variables: { 'heap': '[]' },
    annotations: [{
      id: 'init',
      text: '创建最小堆',
      x: 50,
      y: 30,
      type: 'info',
    }],
  });
  
  // 将每个链表的头节点加入堆
  const heap: { val: number; listIndex: number; nodeIndex: number }[] = [];
  const pointers: number[] = lists.map(() => 0);
  
  lists.forEach((list, listIndex) => {
    if (list.length > 0) {
      heap.push({ val: list[0], listIndex, nodeIndex: 0 });
    }
  });
  
  // 堆排序
  heap.sort((a, b) => a.val - b.val);
  
  const initHeapNodes = JSON.parse(JSON.stringify(initialNodes));
  initHeapNodes.forEach((node: VisualNode) => {
    if (node.nodeIndex === 0 && lists[node.listIndex].length > 0) {
      node.isHighlighted = true;
    }
  });
  
  steps.push({
    id: steps.length,
    description: `将每个链表的头节点加入优先队列：[${heap.map(h => h.val).join(', ')}]`,
    nodes: initHeapNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: [],
    resultEdges: [],
    highlightedLines: { java: [6, 7, 8, 9], python: [5, 6, 7, 8], golang: [6, 7, 8, 9], javascript: [4, 5] },
    variables: { 'heap': `[${heap.map(h => h.val).join(', ')}]` },
    annotations: heap.map((h, i) => ({
      id: `heap-init-${i}`,
      text: `入堆`,
      x: 100 - 30,
      y: 80 + h.listIndex * 100,
      type: 'move' as const,
    })),
  });
  
  // 模拟优先队列合并过程
  const result: number[] = [];
  
  while (heap.length > 0) {
    // 取出最小元素
    const min = heap.shift()!;
    result.push(min.val);
    pointers[min.listIndex]++;
    
    const popNodes = JSON.parse(JSON.stringify(initialNodes));
    popNodes.forEach((node: VisualNode) => {
      if (node.listIndex === min.listIndex && node.nodeIndex === min.nodeIndex) {
        node.isCurrent = true;
      }
      if (node.listIndex === min.listIndex && node.nodeIndex < min.nodeIndex) {
        node.isProcessed = true;
      }
    });
    
    steps.push({
      id: steps.length,
      description: `从堆中取出最小值 ${min.val}，加入结果链表`,
      nodes: popNodes,
      edges: JSON.parse(JSON.stringify(initialEdges)),
      resultNodes: createResultNodes(result, 100, 400, result.length - 1),
      resultEdges: createResultEdges(result.length),
      highlightedLines: { java: [12, 13, 14], python: [12, 13, 14], golang: [14, 15, 16], javascript: [8, 9, 10] },
      variables: { 
        'heap': `[${heap.map(h => h.val).join(', ')}]`,
        'min': String(min.val),
        'result': `[${result.join(', ')}]`
      },
      annotations: [{
        id: `pop-${steps.length}`,
        text: `取出 ${min.val}`,
        x: 100 + min.nodeIndex * 80 + 40,
        y: 80 + min.listIndex * 100 - 25,
        type: 'move',
      }],
    });
    
    // 如果该链表还有下一个节点，加入堆
    const nextIndex = pointers[min.listIndex];
    if (nextIndex < lists[min.listIndex].length) {
      const nextVal = lists[min.listIndex][nextIndex];
      heap.push({ val: nextVal, listIndex: min.listIndex, nodeIndex: nextIndex });
      heap.sort((a, b) => a.val - b.val);
      
      const pushNodes = JSON.parse(JSON.stringify(initialNodes));
      pushNodes.forEach((node: VisualNode) => {
        if (node.listIndex === min.listIndex && node.nodeIndex === nextIndex) {
          node.isHighlighted = true;
        }
        if (node.listIndex === min.listIndex && node.nodeIndex < nextIndex) {
          node.isProcessed = true;
        }
      });
      
      steps.push({
        id: steps.length,
        description: `将下一个节点 ${nextVal} 加入优先队列`,
        nodes: pushNodes,
        edges: JSON.parse(JSON.stringify(initialEdges)),
        resultNodes: createResultNodes(result, 100, 400),
        resultEdges: createResultEdges(result.length),
        highlightedLines: { java: [15, 16, 17], python: [15, 16, 17], golang: [17, 18, 19], javascript: [11, 12] },
        variables: { 
          'heap': `[${heap.map(h => h.val).join(', ')}]`,
          'next': String(nextVal)
        },
        annotations: [{
          id: `push-${steps.length}`,
          text: `入堆 ${nextVal}`,
          x: 100 + nextIndex * 80 - 30,
          y: 80 + min.listIndex * 100,
          type: 'move',
        }],
      });
    }
  }
  
  // 最终结果
  const finalNodes = JSON.parse(JSON.stringify(initialNodes));
  finalNodes.forEach((node: VisualNode) => {
    node.isProcessed = true;
  });
  
  steps.push({
    id: steps.length,
    description: `优先队列合并完成！结果链表：[${result.join(' → ')}]`,
    nodes: finalNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: createResultNodes(result, 100, 400),
    resultEdges: createResultEdges(result.length),
    highlightedLines: { java: [19], python: [19], golang: [21], javascript: [14] },
    variables: { 'result': `[${result.join(', ')}]` },
    annotations: [{
      id: 'complete',
      text: '合并完成！',
      x: 100 + result.length * 40,
      y: 380,
      type: 'result',
    }],
  });
  
  return steps;
}

// 根据算法类型生成步骤
export function generateSteps(algorithmType: AlgorithmType, lists: number[][]): AlgorithmStep[] {
  switch (algorithmType) {
    case 'sequential':
      return generateSequentialSteps(lists);
    case 'divideConquer':
      return generateDivideConquerSteps(lists);
    case 'priorityQueue':
      return generatePriorityQueueSteps(lists);
    default:
      return [];
  }
}
