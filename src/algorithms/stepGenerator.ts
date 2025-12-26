import type { AlgorithmStep, AlgorithmType, VisualNode, VisualEdge, Annotation } from '../types';

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

// 布局常量 - 更松散的间距
const LAYOUT = {
  nodeSpacing: 120,      // 节点水平间距 (原 80)
  listSpacing: 140,      // 链表垂直间距 (原 100)
  resultNodeSpacing: 100, // 结果节点间距 (原 70)
  startX: 150,           // 起始X位置 (原 100)
  startY: 100,           // 起始Y位置 (原 80)
  resultY: 450,          // 结果链表Y位置 (原 400)
};

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
  
  const { nodes: initialNodes, edges: initialEdges } = calculateListLayout(
    lists, LAYOUT.startX, LAYOUT.startY, LAYOUT.nodeSpacing, LAYOUT.listSpacing
  );
  
  // 初始状态 - 添加更详细的算法思路说明
  const initNodes = JSON.parse(JSON.stringify(initialNodes));
  // 为每个链表的头节点添加标签
  initNodes.forEach((node: VisualNode) => {
    if (node.nodeIndex === 0) {
      node.label = `lists[${node.listIndex}]`;
    }
  });
  
  steps.push({
    id: steps.length,
    description: '初始化：准备合并 ' + lists.length + ' 个升序链表',
    nodes: initNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: [],
    resultEdges: [],
    highlightedLines: { java: [3], python: [3], golang: [3], javascript: [2] },
    variables: { ans: 'null', i: '0' },
    annotations: [
      {
        id: 'init-title',
        text: '📋 顺序合并算法',
        x: 50,
        y: 20,
        type: 'info',
      },
      {
        id: 'init-desc1',
        text: '思路：依次将每个链表合并到结果中',
        x: 50,
        y: 45,
        type: 'info',
      },
      {
        id: 'init-desc2',
        text: `共 ${lists.length} 个链表，需要 ${lists.length} 轮合并`,
        x: 50,
        y: 70,
        type: 'info',
      },
    ],
  });
  
  // 模拟合并过程
  let result: number[] = [];
  const processedLists: number[][] = [];
  
  for (let i = 0; i < lists.length; i++) {
    const currentList = lists[i];
    processedLists.push(currentList);
    
    // 合并前状态 - 添加更详细的说明
    const beforeNodes = JSON.parse(JSON.stringify(initialNodes));
    beforeNodes.forEach((node: VisualNode) => {
      if (node.listIndex === i) {
        node.isHighlighted = true;
        // 为当前链表的头节点添加 bPtr 标签
        if (node.nodeIndex === 0) {
          node.label = 'bPtr →';
        }
      } else if (node.listIndex < i) {
        node.isProcessed = true;
      }
    });
    
    // 计算当前轮次的说明
    const roundDesc = i === 0 
      ? `第 1 轮：将第 1 个链表作为初始结果`
      : `第 ${i + 1} 轮：将 ans 与第 ${i + 1} 个链表合并`;
    
    const annotations: Annotation[] = [
      {
        id: `round-${i}`,
        text: `🔄 第 ${i + 1}/${lists.length} 轮合并`,
        x: 50,
        y: 20,
        type: 'info',
      },
      {
        id: `merge-target-${i}`,
        text: `当前链表: [${currentList.join(' → ')}]`,
        x: LAYOUT.startX + currentList.length * LAYOUT.nodeSpacing + 30,
        y: LAYOUT.startY + i * LAYOUT.listSpacing,
        type: 'info',
      },
    ];
    
    if (result.length > 0) {
      annotations.push({
        id: `ans-status-${i}`,
        text: `已合并结果 ans: [${result.join(' → ')}]`,
        x: 50,
        y: 45,
        type: 'result',
      });
    } else {
      annotations.push({
        id: `ans-status-${i}`,
        text: 'ans = null（首次合并）',
        x: 50,
        y: 45,
        type: 'info',
      });
    }
    
    steps.push({
      id: steps.length,
      description: roundDesc,
      nodes: beforeNodes,
      edges: JSON.parse(JSON.stringify(initialEdges)),
      resultNodes: createResultNodes(result, LAYOUT.startX, LAYOUT.resultY),
      resultEdges: createResultEdges(result.length),
      highlightedLines: { java: [4, 5], python: [4, 5], golang: [4, 5], javascript: [3, 4] },
      variables: { ans: result.length > 0 ? `[${result.join(', ')}]` : 'null', i: String(i) },
      annotations,
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
        // 为当前比较的节点添加指针标签
        if (node.listIndex === i && node.nodeIndex === p2) {
          node.isCurrent = true;
          node.label = `bPtr(${currentList[p2]})`;
        }
      });
      
      // 创建带指针标签的结果节点
      const resultNodesWithPtr = createResultNodes([...result], LAYOUT.startX, LAYOUT.resultY);
      if (p1 < result.length && resultNodesWithPtr[p1]) {
        resultNodesWithPtr[p1].isCurrent = true;
        resultNodesWithPtr[p1].label = `aPtr(${result[p1]})`;
      }
      
      const compareResult = result[p1] <= currentList[p2];
      const selectedVal = compareResult ? result[p1] : currentList[p2];
      const compareSymbol = compareResult ? '≤' : '>';
      
      if (result[p1] <= currentList[p2]) {
        merged.push(result[p1]);
        
        // 创建新的结果节点，高亮刚添加的节点
        const newResultNodes = createResultNodes([...merged], LAYOUT.startX, LAYOUT.resultY, merged.length - 1);
        
        steps.push({
          id: steps.length,
          description: `比较 aPtr(${result[p1]}) ${compareSymbol} bPtr(${currentList[p2]})，选择 ${selectedVal} 加入结果`,
          nodes: mergeNodes,
          edges: JSON.parse(JSON.stringify(initialEdges)),
          resultNodes: newResultNodes,
          resultEdges: createResultEdges(merged.length),
          highlightedLines: { java: [16, 17, 18], python: [14, 15, 16], golang: [16, 17, 18], javascript: [14, 15, 16] },
          variables: { 
            'aPtr': `${result[p1]}`,
            'bPtr': `${currentList[p2]}`,
            '比较': `${result[p1]} ${compareSymbol} ${currentList[p2]}`,
            '选择': `${selectedVal}`,
            'merged': `[${merged.join(', ')}]`
          },
          annotations: [
            {
              id: `compare-title-${steps.length}`,
              text: `⚖️ 比较两个指针的值`,
              x: 50,
              y: 20,
              type: 'compare',
            },
            {
              id: `compare-detail-${steps.length}`,
              text: `aPtr.val(${result[p1]}) ${compareSymbol} bPtr.val(${currentList[p2]})`,
              x: 50,
              y: 45,
              type: 'compare',
            },
            {
              id: `compare-action-${steps.length}`,
              text: `✓ 选择较小值 ${selectedVal}，aPtr 后移`,
              x: 50,
              y: 70,
              type: 'move',
            },
            {
              id: `ptr-a-${steps.length}`,
              text: `aPtr →`,
              x: LAYOUT.startX + p1 * LAYOUT.resultNodeSpacing - 45,
              y: LAYOUT.resultY - 35,
              type: 'info',
            },
            {
              id: `ptr-b-${steps.length}`,
              text: `bPtr →`,
              x: LAYOUT.startX + p2 * LAYOUT.nodeSpacing - 45,
              y: LAYOUT.startY + i * LAYOUT.listSpacing - 35,
              type: 'info',
            },
          ],
        });
        
        p1++;
      } else {
        merged.push(currentList[p2]);
        
        // 创建新的结果节点，高亮刚添加的节点
        const newResultNodes = createResultNodes([...merged], LAYOUT.startX, LAYOUT.resultY, merged.length - 1);
        
        steps.push({
          id: steps.length,
          description: `比较 aPtr(${result[p1]}) ${compareSymbol} bPtr(${currentList[p2]})，选择 ${selectedVal} 加入结果`,
          nodes: mergeNodes,
          edges: JSON.parse(JSON.stringify(initialEdges)),
          resultNodes: newResultNodes,
          resultEdges: createResultEdges(merged.length),
          highlightedLines: { java: [19, 20, 21], python: [17, 18, 19], golang: [19, 20, 21], javascript: [17, 18, 19] },
          variables: { 
            'aPtr': `${result[p1]}`,
            'bPtr': `${currentList[p2]}`,
            '比较': `${result[p1]} ${compareSymbol} ${currentList[p2]}`,
            '选择': `${selectedVal}`,
            'merged': `[${merged.join(', ')}]`
          },
          annotations: [
            {
              id: `compare-title-${steps.length}`,
              text: `⚖️ 比较两个指针的值`,
              x: 50,
              y: 20,
              type: 'compare',
            },
            {
              id: `compare-detail-${steps.length}`,
              text: `aPtr.val(${result[p1]}) ${compareSymbol} bPtr.val(${currentList[p2]})`,
              x: 50,
              y: 45,
              type: 'compare',
            },
            {
              id: `compare-action-${steps.length}`,
              text: `✓ 选择较小值 ${selectedVal}，bPtr 后移`,
              x: 50,
              y: 70,
              type: 'move',
            },
            {
              id: `ptr-a-${steps.length}`,
              text: `aPtr →`,
              x: LAYOUT.startX + p1 * LAYOUT.resultNodeSpacing - 45,
              y: LAYOUT.resultY - 35,
              type: 'info',
            },
            {
              id: `ptr-b-${steps.length}`,
              text: `bPtr →`,
              x: LAYOUT.startX + p2 * LAYOUT.nodeSpacing - 45,
              y: LAYOUT.startY + i * LAYOUT.listSpacing - 35,
              type: 'info',
            },
          ],
        });
        
        p2++;
      }
    }
    
    // 处理剩余元素
    const remainingFromResult = p1 < result.length;
    const remainingFromCurrent = p2 < currentList.length;
    
    if (remainingFromResult || remainingFromCurrent) {
      const remainingNodes = JSON.parse(JSON.stringify(initialNodes));
      remainingNodes.forEach((node: VisualNode) => {
        if (node.listIndex <= i) {
          node.isProcessed = true;
        }
        // 标记剩余节点
        if (node.listIndex === i && node.nodeIndex >= p2) {
          node.isHighlighted = true;
        }
      });
      
      // 收集剩余元素
      const remainingElements: number[] = [];
      if (remainingFromResult) {
        for (let k = p1; k < result.length; k++) {
          remainingElements.push(result[k]);
        }
      }
      if (remainingFromCurrent) {
        for (let k = p2; k < currentList.length; k++) {
          remainingElements.push(currentList[k]);
        }
      }
      
      // 将剩余元素添加到 merged
      while (p1 < result.length) {
        merged.push(result[p1++]);
      }
      while (p2 < currentList.length) {
        merged.push(currentList[p2++]);
      }
      
      const sourceDesc = remainingFromResult ? 'ans 链表' : `第 ${i + 1} 个链表`;
      
      steps.push({
        id: steps.length,
        description: `${sourceDesc}有剩余元素 [${remainingElements.join(', ')}]，直接追加到结果末尾`,
        nodes: remainingNodes,
        edges: JSON.parse(JSON.stringify(initialEdges)),
        resultNodes: createResultNodes(merged, LAYOUT.startX, LAYOUT.resultY),
        resultEdges: createResultEdges(merged.length),
        highlightedLines: { java: [24], python: [21], golang: [27, 28, 29, 30, 31], javascript: [22] },
        variables: { 
          '剩余元素': `[${remainingElements.join(', ')}]`,
          'merged': `[${merged.join(', ')}]` 
        },
        annotations: [
          {
            id: `remaining-title-${steps.length}`,
            text: `📎 处理剩余元素`,
            x: 50,
            y: 20,
            type: 'info',
          },
          {
            id: `remaining-desc-${steps.length}`,
            text: `一方遍历完毕，另一方剩余元素已有序`,
            x: 50,
            y: 45,
            type: 'info',
          },
          {
            id: `remaining-action-${steps.length}`,
            text: `直接将 [${remainingElements.join(', ')}] 追加到结果`,
            x: 50,
            y: 70,
            type: 'move',
          },
        ],
      });
    } else {
      // 没有剩余元素的情况，也需要更新 merged
      while (p1 < result.length) {
        merged.push(result[p1++]);
      }
      while (p2 < currentList.length) {
        merged.push(currentList[p2++]);
      }
    }
    
    // 本轮合并完成的总结步骤
    const roundCompleteNodes = JSON.parse(JSON.stringify(initialNodes));
    roundCompleteNodes.forEach((node: VisualNode) => {
      if (node.listIndex <= i) {
        node.isProcessed = true;
      }
    });
    
    steps.push({
      id: steps.length,
      description: `第 ${i + 1} 轮合并完成，ans 更新为 [${merged.join(' → ')}]`,
      nodes: roundCompleteNodes,
      edges: JSON.parse(JSON.stringify(initialEdges)),
      resultNodes: createResultNodes(merged, LAYOUT.startX, LAYOUT.resultY),
      resultEdges: createResultEdges(merged.length),
      highlightedLines: { java: [5, 6], python: [5, 6], golang: [4, 5], javascript: [3, 4] },
      variables: { 
        'ans': `[${merged.join(', ')}]`,
        '已完成轮次': `${i + 1}/${lists.length}`
      },
      annotations: [
        {
          id: `round-complete-${i}`,
          text: `✅ 第 ${i + 1} 轮合并完成`,
          x: 50,
          y: 20,
          type: 'result',
        },
        {
          id: `round-result-${i}`,
          text: `ans = [${merged.join(' → ')}]`,
          x: 50,
          y: 45,
          type: 'result',
        },
        {
          id: `round-progress-${i}`,
          text: i < lists.length - 1 ? `继续下一轮...` : `所有链表合并完成！`,
          x: 50,
          y: 70,
          type: 'info',
        },
      ],
    });
    
    result = merged;
  }
  
  // 最终结果
  const finalNodes = JSON.parse(JSON.stringify(initialNodes));
  finalNodes.forEach((node: VisualNode) => {
    node.isProcessed = true;
  });
  
  steps.push({
    id: steps.length,
    description: `🎉 合并完成！最终结果：[${result.join(' → ')}]`,
    nodes: finalNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: createResultNodes(result, LAYOUT.startX, LAYOUT.resultY),
    resultEdges: createResultEdges(result.length),
    highlightedLines: { java: [6], python: [6], golang: [6], javascript: [5] },
    variables: { 'result': `[${result.join(', ')}]` },
    annotations: [
      {
        id: 'complete-title',
        text: '🎉 顺序合并完成！',
        x: 50,
        y: 20,
        type: 'result',
      },
      {
        id: 'complete-summary',
        text: `共进行了 ${lists.length} 轮合并`,
        x: 50,
        y: 45,
        type: 'info',
      },
      {
        id: 'complete-result',
        text: `最终结果：${result.length} 个节点`,
        x: 50,
        y: 70,
        type: 'result',
      },
      {
        id: 'complete-complexity',
        text: `时间复杂度：O(k²n)`,
        x: 50,
        y: 95,
        type: 'info',
      },
    ],
  });
  
  return steps;
}

// 创建结果链表节点
function createResultNodes(values: number[], startX: number, y: number, highlightIndex?: number): VisualNode[] {
  return values.map((val, index) => ({
    id: `result-${index}`,
    val,
    x: startX + index * LAYOUT.resultNodeSpacing,
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
  
  const { nodes: initialNodes, edges: initialEdges } = calculateListLayout(
    lists, LAYOUT.startX, LAYOUT.startY, LAYOUT.nodeSpacing, LAYOUT.listSpacing
  );
  
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
    resultNodes: createResultNodes(result, LAYOUT.startX, LAYOUT.resultY),
    resultEdges: createResultEdges(result.length),
    highlightedLines: { java: [3], python: [5], golang: [2], javascript: [2] },
    variables: { 'result': `[${result.join(', ')}]` },
    annotations: [{
      id: 'complete',
      text: '分治合并完成！',
      x: LAYOUT.startX + result.length * 50,
      y: LAYOUT.resultY - 30,
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
        x: LAYOUT.startX,
        y: LAYOUT.startY + l * LAYOUT.listSpacing - 25,
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
      x: 500,
      y: LAYOUT.startY + mid * LAYOUT.listSpacing,
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
    resultNodes: createResultNodes(merged, LAYOUT.startX, LAYOUT.resultY - 80 + depth * 60),
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
      x: LAYOUT.startX + merged.length * 50,
      y: LAYOUT.resultY - 100 + depth * 60,
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
  
  const { nodes: initialNodes, edges: initialEdges } = calculateListLayout(
    lists, LAYOUT.startX, LAYOUT.startY, LAYOUT.nodeSpacing, LAYOUT.listSpacing
  );
  
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
      x: LAYOUT.startX - 30,
      y: LAYOUT.startY + h.listIndex * LAYOUT.listSpacing,
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
      resultNodes: createResultNodes(result, LAYOUT.startX, LAYOUT.resultY, result.length - 1),
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
        x: LAYOUT.startX + min.nodeIndex * LAYOUT.nodeSpacing + 50,
        y: LAYOUT.startY + min.listIndex * LAYOUT.listSpacing - 30,
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
        resultNodes: createResultNodes(result, LAYOUT.startX, LAYOUT.resultY),
        resultEdges: createResultEdges(result.length),
        highlightedLines: { java: [15, 16, 17], python: [15, 16, 17], golang: [17, 18, 19], javascript: [11, 12] },
        variables: { 
          'heap': `[${heap.map(h => h.val).join(', ')}]`,
          'next': String(nextVal)
        },
        annotations: [{
          id: `push-${steps.length}`,
          text: `入堆 ${nextVal}`,
          x: LAYOUT.startX + nextIndex * LAYOUT.nodeSpacing - 30,
          y: LAYOUT.startY + min.listIndex * LAYOUT.listSpacing,
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
    resultNodes: createResultNodes(result, LAYOUT.startX, LAYOUT.resultY),
    resultEdges: createResultEdges(result.length),
    highlightedLines: { java: [19], python: [19], golang: [21], javascript: [14] },
    variables: { 'result': `[${result.join(', ')}]` },
    annotations: [{
      id: 'complete',
      text: '合并完成！',
      x: LAYOUT.startX + result.length * 50,
      y: LAYOUT.resultY - 30,
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
