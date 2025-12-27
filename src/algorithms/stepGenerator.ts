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
  
  for (let i = 0; i < lists.length; i++) {
    const currentList = lists[i];
    
    // 合并前状态 - 使用新的配色方案区分正在合并的两个链表
    const beforeNodes = JSON.parse(JSON.stringify(initialNodes));
    beforeNodes.forEach((node: VisualNode) => {
      if (node.listIndex === i) {
        // 当前要合并的B链表 - 橙色
        node.isMergingB = true;
        // 为当前链表的头节点添加 bPtr 标签
        if (node.nodeIndex === 0) {
          node.label = '🟠 B链表';
        }
      } else if (node.listIndex < i) {
        // 已处理完的链表 - 灰色
        node.isProcessed = true;
      } else {
        // 待处理的链表 - 浅灰蓝色（降低视觉权重）
        node.isPending = true;
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
        text: `🟠 当前链表B: [${currentList.join(' → ')}]`,
        x: LAYOUT.startX + currentList.length * LAYOUT.nodeSpacing + 30,
        y: LAYOUT.startY + i * LAYOUT.listSpacing,
        type: 'compare',
      },
    ];
    
    if (result.length > 0) {
      annotations.push({
        id: `ans-status-${i}`,
        text: `🟣 ans链表A: [${result.join(' → ')}]`,
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
    
    // 创建结果节点，标记为正在合并的A链表
    const resultNodesForRound = createResultNodes(result, LAYOUT.startX, LAYOUT.resultY, undefined, true);
    resultNodesForRound.forEach((node) => {
      if (node.nodeIndex === 0 && result.length > 0) {
        node.label = '🟣 A链表';
      }
    });
    
    steps.push({
      id: steps.length,
      description: roundDesc,
      nodes: beforeNodes,
      edges: JSON.parse(JSON.stringify(initialEdges)),
      resultNodes: resultNodesForRound,
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
          // 已处理完的链表 - 灰色
          node.isProcessed = true;
        } else if (node.listIndex === i) {
          // 当前正在合并的B链表 - 橙色
          node.isMergingB = true;
          // 为B链表头节点添加标签
          if (node.nodeIndex === 0) {
            node.label = '🟠 B链表';
          }
          // 当前 bPtr 指向的节点 - 红色突出
          if (node.nodeIndex === p2) {
            node.isCurrent = true;
            if (node.nodeIndex === 0) {
              node.label = '🟠 B链表 ← bPtr';
            } else {
              node.label = '← bPtr';
            }
          }
        } else {
          // 待处理的链表 - 浅灰蓝色
          node.isPending = true;
        }
      });
      
      // 创建带指针标签的结果节点 - aPtr 在结果链表上（紫色）
      const resultNodesWithPtr = createResultNodes([...result], LAYOUT.startX, LAYOUT.resultY, undefined, true);
      resultNodesWithPtr.forEach((node, idx) => {
        if (idx === 0) {
          node.label = '🟣 A链表';
        }
        if (idx === p1) {
          node.isCurrent = true;
          if (idx !== 0) {
            node.label = '← aPtr';
          } else {
            node.label = '🟣 A链表 ← aPtr';
          }
        }
      });
      
      const compareResult = result[p1] <= currentList[p2];
      const selectedVal = compareResult ? result[p1] : currentList[p2];
      const compareSymbol = compareResult ? '≤' : '>';
      const selectedFrom = compareResult ? '🟣 ans链表' : `🟠 链表${i + 1}`;
      
      if (result[p1] <= currentList[p2]) {
        merged.push(result[p1]);
        
        // 创建新的结果节点，高亮刚添加的节点，标记为正在合并的A链表
        const newResultNodes = createResultNodes([...merged], LAYOUT.startX, LAYOUT.resultY, merged.length - 1, true);
        
        steps.push({
          id: steps.length,
          description: `比较: ans[${p1}]=${result[p1]} ${compareSymbol} 链表${i + 1}[${p2}]=${currentList[p2]}，取 ${selectedVal} 加入结果`,
          nodes: mergeNodes,
          edges: JSON.parse(JSON.stringify(initialEdges)),
          resultNodes: newResultNodes,
          resultEdges: createResultEdges(merged.length),
          highlightedLines: { java: [16, 17, 18], python: [14, 15, 16], golang: [16, 17, 18], javascript: [14, 15, 16] },
          variables: { 
            '🟣 aPtr': `ans[${p1}] = ${result[p1]}`,
            '🟠 bPtr': `链表${i + 1}[${p2}] = ${currentList[p2]}`,
            '比较结果': `${result[p1]} ${compareSymbol} ${currentList[p2]}`,
            '选择': `${selectedVal} (来自${selectedFrom})`,
            '新结果': `[${merged.join(', ')}]`
          },
          annotations: [
            {
              id: `merge-info-${steps.length}`,
              text: `🔄 正在合并: 🟣 ans 与 🟠 链表${i + 1}`,
              x: 50,
              y: 20,
              type: 'info',
            },
            {
              id: `compare-detail-${steps.length}`,
              text: `⚖️ 比较: ${result[p1]} ${compareSymbol} ${currentList[p2]}`,
              x: 50,
              y: 45,
              type: 'compare',
            },
            {
              id: `compare-why-${steps.length}`,
              text: `💡 因为 ${selectedVal} 更小，所以先加入结果`,
              x: 50,
              y: 70,
              type: 'info',
            },
            {
              id: `compare-action-${steps.length}`,
              text: `✓ 取 ${selectedVal}，🟣 aPtr 后移`,
              x: 50,
              y: 95,
              type: 'move',
            },
          ],
        });
        
        p1++;
      } else {
        merged.push(currentList[p2]);
        
        // 创建新的结果节点，高亮刚添加的节点，标记为正在合并的A链表
        const newResultNodes = createResultNodes([...merged], LAYOUT.startX, LAYOUT.resultY, merged.length - 1, true);
        
        steps.push({
          id: steps.length,
          description: `比较: ans[${p1}]=${result[p1]} ${compareSymbol} 链表${i + 1}[${p2}]=${currentList[p2]}，取 ${selectedVal} 加入结果`,
          nodes: mergeNodes,
          edges: JSON.parse(JSON.stringify(initialEdges)),
          resultNodes: newResultNodes,
          resultEdges: createResultEdges(merged.length),
          highlightedLines: { java: [19, 20, 21], python: [17, 18, 19], golang: [19, 20, 21], javascript: [17, 18, 19] },
          variables: { 
            '🟣 aPtr': `ans[${p1}] = ${result[p1]}`,
            '🟠 bPtr': `链表${i + 1}[${p2}] = ${currentList[p2]}`,
            '比较结果': `${result[p1]} ${compareSymbol} ${currentList[p2]}`,
            '选择': `${selectedVal} (来自${selectedFrom})`,
            '新结果': `[${merged.join(', ')}]`
          },
          annotations: [
            {
              id: `merge-info-${steps.length}`,
              text: `🔄 正在合并: 🟣 ans 与 🟠 链表${i + 1}`,
              x: 50,
              y: 20,
              type: 'info',
            },
            {
              id: `compare-detail-${steps.length}`,
              text: `⚖️ 比较: ${result[p1]} ${compareSymbol} ${currentList[p2]}`,
              x: 50,
              y: 45,
              type: 'compare',
            },
            {
              id: `compare-why-${steps.length}`,
              text: `💡 因为 ${selectedVal} 更小，所以先加入结果`,
              x: 50,
              y: 70,
              type: 'info',
            },
            {
              id: `compare-action-${steps.length}`,
              text: `✓ 取 ${selectedVal}，🟠 bPtr 后移`,
              x: 50,
              y: 95,
              type: 'move',
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
        if (node.listIndex < i) {
          node.isProcessed = true;
        } else if (node.listIndex === i) {
          node.isProcessed = true;
          // 标记剩余节点
          if (node.nodeIndex >= p2) {
            node.isMergingB = true;
            node.isProcessed = false;
          }
        } else {
          node.isPending = true;
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
      
      const sourceDesc = remainingFromResult ? '🟣 ans 链表' : `🟠 第 ${i + 1} 个链表`;
      
      steps.push({
        id: steps.length,
        description: `${sourceDesc}有剩余元素 [${remainingElements.join(', ')}]，直接追加到结果末尾`,
        nodes: remainingNodes,
        edges: JSON.parse(JSON.stringify(initialEdges)),
        resultNodes: createResultNodes(merged, LAYOUT.startX, LAYOUT.resultY, undefined, true),
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
            id: `remaining-why-${steps.length}`,
            text: `💡 为什么可以直接追加？`,
            x: 50,
            y: 45,
            type: 'info',
          },
          {
            id: `remaining-reason-${steps.length}`,
            text: `因为链表有序，剩余元素一定≥已合并的最大值`,
            x: 50,
            y: 70,
            type: 'info',
          },
          {
            id: `remaining-action-${steps.length}`,
            text: `✓ 追加 [${remainingElements.join(', ')}] 到结果末尾`,
            x: 50,
            y: 95,
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
      } else {
        node.isPending = true;
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
          id: `round-why-${i}`,
          text: `💡 ans 现在包含了前 ${i + 1} 个链表的所有元素`,
          x: 50,
          y: 45,
          type: 'info',
        },
        {
          id: `round-result-${i}`,
          text: `ans = [${merged.join(' → ')}]`,
          x: 50,
          y: 70,
          type: 'result',
        },
        {
          id: `round-progress-${i}`,
          text: i < lists.length - 1 ? `下一轮将合并第 ${i + 2} 个链表` : `所有链表合并完成！`,
          x: 50,
          y: 95,
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
        id: 'complete-why',
        text: `💡 通过 ${lists.length} 轮两两合并，所有链表已合并为一个`,
        x: 50,
        y: 45,
        type: 'info',
      },
      {
        id: 'complete-result',
        text: `最终结果：${result.length} 个节点，已升序排列`,
        x: 50,
        y: 70,
        type: 'result',
      },
      {
        id: 'complete-complexity',
        text: `时间复杂度：O(k²n)，空间复杂度：O(1)`,
        x: 50,
        y: 95,
        type: 'info',
      },
    ],
  });
  
  return steps;
}

// 创建结果链表节点
function createResultNodes(values: number[], startX: number, y: number, highlightIndex?: number, isMergingA?: boolean): VisualNode[] {
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
    isMergingA: isMergingA || false,
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
  
  // 为每个链表的头节点添加标签
  const initNodes = JSON.parse(JSON.stringify(initialNodes));
  initNodes.forEach((node: VisualNode) => {
    if (node.nodeIndex === 0) {
      node.label = `lists[${node.listIndex}]`;
    }
  });
  
  // 计算分治树的深度
  const treeDepth = Math.ceil(Math.log2(lists.length));
  
  // 初始状态 - 添加详细的算法思路说明
  steps.push({
    id: steps.length,
    description: '初始化：使用分治法合并 ' + lists.length + ' 个升序链表',
    nodes: initNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: [],
    resultEdges: [],
    highlightedLines: { java: [2, 3], python: [2, 3], golang: [2], javascript: [2] },
    variables: { l: '0', r: String(lists.length - 1) },
    annotations: [
      {
        id: 'init-title',
        text: '📋 分治合并算法',
        x: 50,
        y: 20,
        type: 'info',
      },
      {
        id: 'init-desc1',
        text: '思路：将链表数组不断二分，直到只剩单个链表',
        x: 50,
        y: 45,
        type: 'info',
      },
      {
        id: 'init-desc2',
        text: '然后自底向上两两合并，类似归并排序',
        x: 50,
        y: 70,
        type: 'info',
      },
      {
        id: 'init-desc3',
        text: `共 ${lists.length} 个链表，分治树深度约 ${treeDepth} 层`,
        x: 50,
        y: 95,
        type: 'info',
      },
    ],
  });
  
  // 递归分治过程
  const result = divideConquerRecursive(lists, 0, lists.length - 1, steps, initialNodes, initialEdges, 0, lists.length);
  
  // 最终结果
  const finalNodes = JSON.parse(JSON.stringify(initialNodes));
  finalNodes.forEach((node: VisualNode) => {
    node.isProcessed = true;
  });
  
  steps.push({
    id: steps.length,
    description: `🎉 分治合并完成！结果链表：[${result.join(' → ')}]`,
    nodes: finalNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: createResultNodes(result, LAYOUT.startX, LAYOUT.resultY),
    resultEdges: createResultEdges(result.length),
    highlightedLines: { java: [3], python: [5], golang: [2], javascript: [2] },
    variables: { 'result': `[${result.join(', ')}]` },
    annotations: [
      {
        id: 'complete-title',
        text: '🎉 分治合并完成！',
        x: 50,
        y: 20,
        type: 'result',
      },
      {
        id: 'complete-why',
        text: `💡 通过分治策略，将 ${lists.length} 个链表合并为一个`,
        x: 50,
        y: 45,
        type: 'info',
      },
      {
        id: 'complete-result',
        text: `最终结果：${result.length} 个节点，已升序排列`,
        x: 50,
        y: 70,
        type: 'result',
      },
      {
        id: 'complete-complexity',
        text: `时间复杂度：O(kn × logk)，空间复杂度：O(logk)`,
        x: 50,
        y: 95,
        type: 'info',
      },
    ],
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
  depth: number,
  totalLists: number
): number[] {
  if (l > r) return [];
  if (l === r) {
    const nodes = JSON.parse(JSON.stringify(initialNodes));
    nodes.forEach((node: VisualNode) => {
      if (node.listIndex === l) {
        node.isHighlighted = true;
        // 为叶子节点添加标签
        if (node.nodeIndex === 0) {
          node.label = `🟢 lists[${l}]`;
        }
      } else {
        node.isPending = true;
      }
    });
    
    steps.push({
      id: steps.length,
      description: `递归到达叶子节点：返回第 ${l + 1} 个链表 [${lists[l].join(' → ')}]`,
      nodes,
      edges: JSON.parse(JSON.stringify(initialEdges)),
      resultNodes: [],
      resultEdges: [],
      highlightedLines: { java: [6], python: [8], golang: [5], javascript: [3] },
      variables: { l: String(l), r: String(r), depth: String(depth) },
      annotations: [
        {
          id: `leaf-title-${l}`,
          text: `🍃 到达叶子节点（深度 ${depth}）`,
          x: 50,
          y: 20,
          type: 'info',
        },
        {
          id: `leaf-why-${l}`,
          text: `💡 l == r == ${l}，无法再分割`,
          x: 50,
          y: 45,
          type: 'info',
        },
        {
          id: `leaf-action-${l}`,
          text: `✓ 直接返回 lists[${l}] = [${lists[l].join(' → ')}]`,
          x: 50,
          y: 70,
          type: 'result',
        },
        {
          id: `leaf-arrow-${l}`,
          text: `← 叶子节点`,
          x: LAYOUT.startX + lists[l].length * LAYOUT.nodeSpacing + 20,
          y: LAYOUT.startY + l * LAYOUT.listSpacing,
          type: 'move',
        },
      ],
    });
    
    return lists[l];
  }
  
  const mid = Math.floor((l + r) / 2);
  const leftCount = mid - l + 1;
  const rightCount = r - mid;
  
  // 分割步骤 - 添加更详细的标注
  const splitNodes = JSON.parse(JSON.stringify(initialNodes));
  splitNodes.forEach((node: VisualNode) => {
    if (node.listIndex >= l && node.listIndex <= mid) {
      node.isHighlighted = true;
      node.isMergingA = true;
      // 为左半部分头节点添加标签
      if (node.nodeIndex === 0) {
        node.label = `🟣 左[${node.listIndex}]`;
      }
    } else if (node.listIndex > mid && node.listIndex <= r) {
      node.isCurrent = true;
      node.isMergingB = true;
      // 为右半部分头节点添加标签
      if (node.nodeIndex === 0) {
        node.label = `🟠 右[${node.listIndex}]`;
      }
    } else {
      node.isPending = true;
    }
  });
  
  steps.push({
    id: steps.length,
    description: `分割：将链表 ${l + 1}-${r + 1} 分为左半部分 [${l + 1}-${mid + 1}] 和右半部分 [${mid + 2}-${r + 1}]`,
    nodes: splitNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: [],
    resultEdges: [],
    highlightedLines: { java: [7, 8, 9, 10, 11], python: [9, 10, 11, 12, 13], golang: [6, 7, 8, 9, 10], javascript: [4, 5, 6, 7, 8] },
    variables: { 
      l: String(l), 
      r: String(r), 
      mid: String(mid), 
      depth: String(depth),
      '左半部分': `lists[${l}..${mid}]`,
      '右半部分': `lists[${mid + 1}..${r}]`
    },
    annotations: [
      {
        id: `split-title-${l}-${r}`,
        text: `✂️ 分割阶段（深度 ${depth}）`,
        x: 50,
        y: 20,
        type: 'info',
      },
      {
        id: `split-calc-${l}-${r}`,
        text: `💡 mid = (${l} + ${r}) / 2 = ${mid}`,
        x: 50,
        y: 45,
        type: 'info',
      },
      {
        id: `split-left-${l}-${r}`,
        text: `🟣 左半部分: lists[${l}..${mid}]（${leftCount}个链表）`,
        x: 50,
        y: 70,
        type: 'compare',
      },
      {
        id: `split-right-${l}-${r}`,
        text: `🟠 右半部分: lists[${mid + 1}..${r}]（${rightCount}个链表）`,
        x: 50,
        y: 95,
        type: 'move',
      },
      {
        id: `split-next-${l}-${r}`,
        text: `→ 先递归处理左半部分`,
        x: 50,
        y: 120,
        type: 'info',
      },
    ],
  });
  
  // 递归左半部分
  const leftResult = divideConquerRecursive(lists, l, mid, steps, initialNodes, initialEdges, depth + 1, totalLists);
  
  // 添加一个步骤说明即将处理右半部分
  if (mid + 1 <= r) {
    const beforeRightNodes = JSON.parse(JSON.stringify(initialNodes));
    beforeRightNodes.forEach((node: VisualNode) => {
      if (node.listIndex >= l && node.listIndex <= mid) {
        node.isProcessed = true;
      } else if (node.listIndex > mid && node.listIndex <= r) {
        node.isHighlighted = true;
        if (node.nodeIndex === 0) {
          node.label = `🟠 待处理`;
        }
      } else {
        node.isPending = true;
      }
    });
    
    steps.push({
      id: steps.length,
      description: `左半部分处理完成，结果为 [${leftResult.join(' → ')}]，现在处理右半部分`,
      nodes: beforeRightNodes,
      edges: JSON.parse(JSON.stringify(initialEdges)),
      resultNodes: createResultNodes(leftResult, LAYOUT.startX, LAYOUT.resultY - 60),
      resultEdges: createResultEdges(leftResult.length),
      highlightedLines: { java: [9], python: [11], golang: [8], javascript: [6] },
      variables: { 
        '左半部分结果': `[${leftResult.join(', ')}]`,
        '下一步': `处理右半部分 lists[${mid + 1}..${r}]`
      },
      annotations: [
        {
          id: `left-done-${l}-${r}`,
          text: `✅ 左半部分递归完成`,
          x: 50,
          y: 20,
          type: 'result',
        },
        {
          id: `left-result-${l}-${r}`,
          text: `🟣 左半部分结果: [${leftResult.join(' → ')}]`,
          x: 50,
          y: 45,
          type: 'result',
        },
        {
          id: `right-next-${l}-${r}`,
          text: `→ 现在递归处理右半部分`,
          x: 50,
          y: 70,
          type: 'move',
        },
      ],
    });
  }
  
  // 递归右半部分
  const rightResult = divideConquerRecursive(lists, mid + 1, r, steps, initialNodes, initialEdges, depth + 1, totalLists);
  
  // 合并步骤 - 添加详细的合并过程说明
  const merged = mergeTwoArrays(leftResult, rightResult);
  
  const mergeNodes = JSON.parse(JSON.stringify(initialNodes));
  mergeNodes.forEach((node: VisualNode) => {
    if (node.listIndex >= l && node.listIndex <= mid) {
      node.isMergingA = true;
      if (node.nodeIndex === 0) {
        node.label = `🟣 左结果`;
      }
    } else if (node.listIndex > mid && node.listIndex <= r) {
      node.isMergingB = true;
      if (node.nodeIndex === 0) {
        node.label = `🟠 右结果`;
      }
    } else {
      node.isPending = true;
    }
    // 标记已处理
    if (node.listIndex >= l && node.listIndex <= r) {
      node.isProcessed = true;
    }
  });
  
  // 计算合并结果的Y位置，根据深度调整
  const mergeResultY = LAYOUT.resultY - 80 + depth * 60;
  
  steps.push({
    id: steps.length,
    description: `合并：[${leftResult.join(' → ')}] + [${rightResult.join(' → ')}] = [${merged.join(' → ')}]`,
    nodes: mergeNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: createResultNodes(merged, LAYOUT.startX, mergeResultY),
    resultEdges: createResultEdges(merged.length),
    highlightedLines: { java: [8, 9, 10, 11], python: [10, 11, 12, 13], golang: [7, 8, 9, 10], javascript: [5, 6, 7, 8] },
    variables: { 
      '🟣 左结果': `[${leftResult.join(', ')}]`,
      '🟠 右结果': `[${rightResult.join(', ')}]`,
      '合并结果': `[${merged.join(', ')}]`,
      '深度': String(depth)
    },
    annotations: [
      {
        id: `merge-title-${l}-${r}`,
        text: `🔀 合并阶段（深度 ${depth}）`,
        x: 50,
        y: 20,
        type: 'info',
      },
      {
        id: `merge-left-${l}-${r}`,
        text: `🟣 左结果: [${leftResult.join(' → ')}]`,
        x: 50,
        y: 45,
        type: 'compare',
      },
      {
        id: `merge-right-${l}-${r}`,
        text: `🟠 右结果: [${rightResult.join(' → ')}]`,
        x: 50,
        y: 70,
        type: 'move',
      },
      {
        id: `merge-how-${l}-${r}`,
        text: `💡 使用双指针法合并两个有序链表`,
        x: 50,
        y: 95,
        type: 'info',
      },
      {
        id: `merge-result-${l}-${r}`,
        text: `✓ 合并结果: [${merged.join(' → ')}]`,
        x: 50,
        y: 120,
        type: 'result',
      },
      {
        id: `merge-arrow-${l}-${r}`,
        text: `← 深度${depth}合并结果`,
        x: LAYOUT.startX + merged.length * LAYOUT.resultNodeSpacing + 20,
        y: mergeResultY,
        type: 'result',
      },
    ],
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
  
  // 计算总节点数
  const totalNodes = lists.reduce((sum, list) => sum + list.length, 0);
  
  // 为每个链表的头节点添加标签
  const initNodes = JSON.parse(JSON.stringify(initialNodes));
  initNodes.forEach((node: VisualNode) => {
    if (node.nodeIndex === 0) {
      node.label = `lists[${node.listIndex}]`;
    }
  });
  
  // 初始状态 - 添加详细的算法思路说明
  steps.push({
    id: steps.length,
    description: '初始化：创建优先队列（最小堆）',
    nodes: initNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: [],
    resultEdges: [],
    highlightedLines: { java: [3, 4, 5], python: [4], golang: [5], javascript: [3] },
    variables: { 'heap': '[]' },
    annotations: [
      {
        id: 'init-title',
        text: '📋 优先队列算法（最小堆）',
        x: 50,
        y: 20,
        type: 'info',
      },
      {
        id: 'init-desc1',
        text: '思路：用最小堆维护每个链表的当前最小元素',
        x: 50,
        y: 45,
        type: 'info',
      },
      {
        id: 'init-desc2',
        text: '每次取出堆顶（全局最小），加入结果链表',
        x: 50,
        y: 70,
        type: 'info',
      },
      {
        id: 'init-desc3',
        text: `共 ${lists.length} 个链表，${totalNodes} 个节点`,
        x: 50,
        y: 95,
        type: 'info',
      },
    ],
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
      node.label = `🔵 入堆`;
    }
  });
  
  // 构建堆内容的可视化字符串
  const heapDisplay = heap.map(h => `${h.val}(链表${h.listIndex + 1})`).join(', ');
  
  steps.push({
    id: steps.length,
    description: `将每个链表的头节点加入优先队列：[${heap.map(h => h.val).join(', ')}]`,
    nodes: initHeapNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: [],
    resultEdges: [],
    highlightedLines: { java: [6, 7, 8, 9], python: [5, 6, 7, 8], golang: [6, 7, 8, 9], javascript: [4, 5] },
    variables: { 
      'heap': `[${heap.map(h => h.val).join(', ')}]`,
      '堆大小': String(heap.length)
    },
    annotations: [
      {
        id: 'heap-init-title',
        text: '📥 初始化堆',
        x: 50,
        y: 20,
        type: 'info',
      },
      {
        id: 'heap-init-why',
        text: '💡 将每个链表的头节点（最小值）加入堆',
        x: 50,
        y: 45,
        type: 'info',
      },
      {
        id: 'heap-init-content',
        text: `🔵 堆内容: [${heapDisplay}]`,
        x: 50,
        y: 70,
        type: 'compare',
      },
      {
        id: 'heap-init-min',
        text: `⬆️ 堆顶（最小值）: ${heap[0]?.val}`,
        x: 50,
        y: 95,
        type: 'result',
      },
      ...heap.map((h, i) => ({
        id: `heap-init-arrow-${i}`,
        text: `← 入堆`,
        x: LAYOUT.startX + 50,
        y: LAYOUT.startY + h.listIndex * LAYOUT.listSpacing,
        type: 'move' as const,
      })),
    ],
  });
  
  // 模拟优先队列合并过程
  const result: number[] = [];
  let stepCount = 0;
  
  while (heap.length > 0) {
    stepCount++;
    
    // 取出最小元素
    const min = heap.shift()!;
    result.push(min.val);
    pointers[min.listIndex]++;
    
    const popNodes = JSON.parse(JSON.stringify(initialNodes));
    popNodes.forEach((node: VisualNode) => {
      if (node.listIndex === min.listIndex && node.nodeIndex === min.nodeIndex) {
        node.isCurrent = true;
        node.label = `🔴 取出`;
      }
      if (node.listIndex === min.listIndex && node.nodeIndex < min.nodeIndex) {
        node.isProcessed = true;
      }
      // 标记堆中其他元素
      const inHeap = heap.find(h => h.listIndex === node.listIndex && h.nodeIndex === node.nodeIndex);
      if (inHeap) {
        node.isHighlighted = true;
        if (node.nodeIndex === 0 || node.nodeIndex === pointers[node.listIndex]) {
          node.label = `🔵 在堆中`;
        }
      }
    });
    
    // 构建当前堆状态的显示
    const currentHeapDisplay = heap.length > 0 
      ? heap.map(h => `${h.val}`).join(', ')
      : '空';
    
    steps.push({
      id: steps.length,
      description: `从堆中取出最小值 ${min.val}（来自链表${min.listIndex + 1}），加入结果链表`,
      nodes: popNodes,
      edges: JSON.parse(JSON.stringify(initialEdges)),
      resultNodes: createResultNodes(result, LAYOUT.startX, LAYOUT.resultY, result.length - 1),
      resultEdges: createResultEdges(result.length),
      highlightedLines: { java: [12, 13, 14], python: [12, 13, 14], golang: [14, 15, 16], javascript: [8, 9, 10] },
      variables: { 
        'heap': `[${currentHeapDisplay}]`,
        '取出值': String(min.val),
        '来源': `链表${min.listIndex + 1}[${min.nodeIndex}]`,
        'result': `[${result.join(', ')}]`
      },
      annotations: [
        {
          id: `pop-title-${stepCount}`,
          text: `📤 第 ${stepCount} 次取出`,
          x: 50,
          y: 20,
          type: 'info',
        },
        {
          id: `pop-action-${stepCount}`,
          text: `🔴 取出堆顶: ${min.val}（来自链表${min.listIndex + 1}）`,
          x: 50,
          y: 45,
          type: 'move',
        },
        {
          id: `pop-why-${stepCount}`,
          text: `💡 ${min.val} 是当前所有链表头节点中的最小值`,
          x: 50,
          y: 70,
          type: 'info',
        },
        {
          id: `pop-result-${stepCount}`,
          text: `✓ 加入结果: [${result.join(' → ')}]`,
          x: 50,
          y: 95,
          type: 'result',
        },
        {
          id: `pop-arrow-${stepCount}`,
          text: `🔴 取出 ${min.val}`,
          x: LAYOUT.startX + min.nodeIndex * LAYOUT.nodeSpacing + 50,
          y: LAYOUT.startY + min.listIndex * LAYOUT.listSpacing - 30,
          type: 'move',
        },
      ],
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
          node.label = `🔵 入堆`;
        }
        if (node.listIndex === min.listIndex && node.nodeIndex < nextIndex) {
          node.isProcessed = true;
        }
        // 标记堆中其他元素
        const inHeap = heap.find(h => h.listIndex === node.listIndex && h.nodeIndex === node.nodeIndex);
        if (inHeap && !(node.listIndex === min.listIndex && node.nodeIndex === nextIndex)) {
          node.isMergingB = true;
        }
      });
      
      // 新的堆状态
      const newHeapDisplay = heap.map(h => `${h.val}`).join(', ');
      const newHeapTop = heap[0]?.val;
      
      steps.push({
        id: steps.length,
        description: `将链表${min.listIndex + 1}的下一个节点 ${nextVal} 加入优先队列`,
        nodes: pushNodes,
        edges: JSON.parse(JSON.stringify(initialEdges)),
        resultNodes: createResultNodes(result, LAYOUT.startX, LAYOUT.resultY),
        resultEdges: createResultEdges(result.length),
        highlightedLines: { java: [15, 16, 17], python: [15, 16, 17], golang: [17, 18, 19], javascript: [11, 12] },
        variables: { 
          'heap': `[${newHeapDisplay}]`,
          '新入堆': String(nextVal),
          '新堆顶': String(newHeapTop)
        },
        annotations: [
          {
            id: `push-title-${stepCount}`,
            text: `📥 补充堆元素`,
            x: 50,
            y: 20,
            type: 'info',
          },
          {
            id: `push-action-${stepCount}`,
            text: `🔵 入堆: ${nextVal}（链表${min.listIndex + 1}[${nextIndex}]）`,
            x: 50,
            y: 45,
            type: 'move',
          },
          {
            id: `push-why-${stepCount}`,
            text: `💡 链表${min.listIndex + 1}还有剩余节点，将下一个加入堆`,
            x: 50,
            y: 70,
            type: 'info',
          },
          {
            id: `push-heap-${stepCount}`,
            text: `🔵 当前堆: [${newHeapDisplay}]`,
            x: 50,
            y: 95,
            type: 'compare',
          },
          {
            id: `push-top-${stepCount}`,
            text: `⬆️ 新堆顶: ${newHeapTop}`,
            x: 50,
            y: 120,
            type: 'result',
          },
          {
            id: `push-arrow-${stepCount}`,
            text: `🔵 入堆 ${nextVal}`,
            x: LAYOUT.startX + nextIndex * LAYOUT.nodeSpacing + 50,
            y: LAYOUT.startY + min.listIndex * LAYOUT.listSpacing - 30,
            type: 'move',
          },
        ],
      });
    } else {
      // 该链表已经处理完毕
      if (heap.length > 0) {
        const exhaustedNodes = JSON.parse(JSON.stringify(initialNodes));
        exhaustedNodes.forEach((node: VisualNode) => {
          if (node.listIndex === min.listIndex) {
            node.isProcessed = true;
          }
          // 标记堆中其他元素
          const inHeap = heap.find(h => h.listIndex === node.listIndex && h.nodeIndex === node.nodeIndex);
          if (inHeap) {
            node.isHighlighted = true;
          }
        });
        
        steps.push({
          id: steps.length,
          description: `链表${min.listIndex + 1}已全部处理完毕`,
          nodes: exhaustedNodes,
          edges: JSON.parse(JSON.stringify(initialEdges)),
          resultNodes: createResultNodes(result, LAYOUT.startX, LAYOUT.resultY),
          resultEdges: createResultEdges(result.length),
          highlightedLines: { java: [15, 16, 17], python: [15, 16, 17], golang: [17, 18, 19], javascript: [11, 12] },
          variables: { 
            'heap': `[${heap.map(h => h.val).join(', ')}]`,
            '已完成': `链表${min.listIndex + 1}`
          },
          annotations: [
            {
              id: `exhausted-title-${stepCount}`,
              text: `✅ 链表${min.listIndex + 1}处理完毕`,
              x: 50,
              y: 20,
              type: 'result',
            },
            {
              id: `exhausted-why-${stepCount}`,
              text: `💡 该链表没有更多节点，无需入堆`,
              x: 50,
              y: 45,
              type: 'info',
            },
            {
              id: `exhausted-remain-${stepCount}`,
              text: `🔵 堆中剩余: [${heap.map(h => h.val).join(', ')}]`,
              x: 50,
              y: 70,
              type: 'compare',
            },
          ],
        });
      }
    }
  }
  
  // 最终结果
  const finalNodes = JSON.parse(JSON.stringify(initialNodes));
  finalNodes.forEach((node: VisualNode) => {
    node.isProcessed = true;
  });
  
  steps.push({
    id: steps.length,
    description: `🎉 优先队列合并完成！结果链表：[${result.join(' → ')}]`,
    nodes: finalNodes,
    edges: JSON.parse(JSON.stringify(initialEdges)),
    resultNodes: createResultNodes(result, LAYOUT.startX, LAYOUT.resultY),
    resultEdges: createResultEdges(result.length),
    highlightedLines: { java: [19], python: [19], golang: [21], javascript: [14] },
    variables: { 'result': `[${result.join(', ')}]` },
    annotations: [
      {
        id: 'complete-title',
        text: '🎉 优先队列合并完成！',
        x: 50,
        y: 20,
        type: 'result',
      },
      {
        id: 'complete-why',
        text: `💡 通过 ${stepCount} 次取出操作，所有节点已合并`,
        x: 50,
        y: 45,
        type: 'info',
      },
      {
        id: 'complete-result',
        text: `最终结果：${result.length} 个节点，已升序排列`,
        x: 50,
        y: 70,
        type: 'result',
      },
      {
        id: 'complete-complexity',
        text: `时间复杂度：O(kn × logk)，空间复杂度：O(k)`,
        x: 50,
        y: 95,
        type: 'info',
      },
    ],
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
