import { useStore } from '../../store/useStore';
import './ExplanationPanel.css';

// 算法解释配置 - 为每种步骤类型提供"为什么"的解释
const EXPLANATIONS = {
  // 顺序合并算法的解释
  sequential: {
    init: {
      title: '💡 为什么使用顺序合并？',
      content: '顺序合并是最直观的方法：将第一个链表作为初始结果，然后依次将其他链表合并进来。虽然时间复杂度较高 O(k²n)，但实现简单，适合链表数量较少的情况。',
    },
    roundStart: {
      title: '💡 为什么要逐个合并？',
      content: '每次只合并两个有序链表，可以复用"合并两个有序链表"的经典算法。这样问题被分解为多个简单的子问题。',
    },
    compare: {
      title: '💡 为什么比较头节点？',
      content: '因为两个链表都是升序的，所以头节点一定是各自链表中最小的。比较两个头节点，较小的那个就是当前所有未处理节点中最小的，应该先加入结果。',
    },
    movePointer: {
      title: '💡 为什么移动指针？',
      content: '选中的节点已经加入结果链表，所以需要将对应链表的指针后移，指向下一个待比较的节点。',
    },
    remaining: {
      title: '💡 为什么直接追加剩余元素？',
      content: '当一个链表遍历完毕时，另一个链表的剩余元素一定都比已合并的元素大（因为链表是升序的），所以可以直接追加到结果末尾，无需再比较。',
    },
    roundComplete: {
      title: '💡 本轮合并的意义',
      content: '完成一轮合并后，ans 链表包含了更多的有序元素。随着轮次增加，ans 会越来越长，最终包含所有链表的全部元素。',
    },
    complete: {
      title: '🎯 算法总结',
      content: '顺序合并通过 k-1 次两两合并，将 k 个链表合并为一个。时间复杂度 O(k²n)，空间复杂度 O(1)。适合链表数量较少的场景。',
    },
  },
  // 分治合并算法的解释
  divideConquer: {
    init: {
      title: '💡 为什么使用分治法？',
      content: '分治法将问题分解为更小的子问题：先将链表分成两半，分别合并，再将结果合并。这样可以减少重复比较，时间复杂度降为 O(kn·logk)。',
    },
    split: {
      title: '💡 为什么要分割？',
      content: '分割是分治法的核心：将大问题分解为小问题。每次将链表数组从中间分开，直到每组只有一个链表（基本情况）。',
    },
    leaf: {
      title: '💡 为什么单个链表直接返回？',
      content: '单个链表本身就是有序的，不需要合并操作，这是递归的基本情况（base case）。',
    },
    merge: {
      title: '💡 为什么合并两个结果？',
      content: '左右两边分别递归处理后，各自得到一个有序链表。将这两个有序链表合并，就得到了更大范围的有序结果。这是分治法的"治"阶段。',
    },
    complete: {
      title: '🎯 算法总结',
      content: '分治合并通过递归分割和合并，将时间复杂度优化到 O(kn·logk)。相比顺序合并，在链表数量较多时效率更高。',
    },
  },
  // 优先队列算法的解释
  priorityQueue: {
    init: {
      title: '💡 为什么使用优先队列？',
      content: '优先队列（最小堆）可以在 O(logk) 时间内找到 k 个元素中的最小值。每次取出最小元素后，只需将该链表的下一个元素入堆，避免了重复比较。',
    },
    initHeap: {
      title: '💡 为什么先将头节点入堆？',
      content: '每个链表的头节点是该链表的最小元素。将所有头节点放入最小堆，堆顶就是全局最小值，这是贪心策略的起点。',
    },
    pop: {
      title: '💡 为什么取堆顶元素？',
      content: '最小堆的堆顶始终是当前所有待处理节点中的最小值。取出堆顶加入结果，保证了结果链表的有序性。',
    },
    push: {
      title: '💡 为什么将下一个节点入堆？',
      content: '取出一个节点后，该链表的下一个节点成为新的候选最小值。将其入堆，维护"每个链表有一个代表在堆中"的不变量。',
    },
    complete: {
      title: '🎯 算法总结',
      content: '优先队列方法时间复杂度 O(kn·logk)，与分治法相同，但实现更直观。空间复杂度 O(k) 用于维护堆。是面试中的最优解法之一。',
    },
  },
};

// 根据步骤描述判断步骤类型
function getStepType(description: string, algorithmType: string): string {
  if (algorithmType === 'sequential') {
    if (description.includes('初始化')) return 'init';
    if (description.includes('轮：将')) return 'roundStart';
    if (description.includes('比较')) return 'compare';
    if (description.includes('剩余元素')) return 'remaining';
    if (description.includes('轮合并完成')) return 'roundComplete';
    if (description.includes('合并完成！最终结果')) return 'complete';
    return 'compare'; // 默认
  }
  if (algorithmType === 'divideConquer') {
    if (description.includes('初始化')) return 'init';
    if (description.includes('分割')) return 'split';
    if (description.includes('叶子节点')) return 'leaf';
    if (description.includes('合并')) return 'merge';
    if (description.includes('分治合并完成')) return 'complete';
    return 'merge';
  }
  if (algorithmType === 'priorityQueue') {
    if (description.includes('创建优先队列')) return 'init';
    if (description.includes('头节点加入优先队列')) return 'initHeap';
    if (description.includes('取出最小值')) return 'pop';
    if (description.includes('加入优先队列')) return 'push';
    if (description.includes('优先队列合并完成')) return 'complete';
    return 'pop';
  }
  return 'init';
}

export function ExplanationPanel() {
  const { steps, playback, algorithmType } = useStore();
  const currentStep = steps[playback.currentStep];
  
  if (!currentStep) return null;
  
  const stepType = getStepType(currentStep.description, algorithmType);
  const explanations = EXPLANATIONS[algorithmType as keyof typeof EXPLANATIONS];
  const explanation = explanations?.[stepType as keyof typeof explanations];
  
  if (!explanation) return null;
  
  return (
    <div className="explanation-panel">
      <div className="explanation-title">{explanation.title}</div>
      <div className="explanation-content">{explanation.content}</div>
    </div>
  );
}
