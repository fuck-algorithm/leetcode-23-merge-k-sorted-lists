import type { InputData } from '../types';

// 验证输入数据
export function validateInput(input: string): InputData {
  const trimmed = input.trim();
  
  // 空输入
  if (!trimmed) {
    return {
      lists: [],
      isValid: true,
    };
  }
  
  try {
    // 尝试解析JSON格式
    const parsed = JSON.parse(trimmed);
    
    // 检查是否为数组
    if (!Array.isArray(parsed)) {
      return {
        lists: [],
        isValid: false,
        errorMessage: '输入必须是一个数组',
      };
    }
    
    // 检查每个元素是否为数组
    for (let i = 0; i < parsed.length; i++) {
      if (!Array.isArray(parsed[i])) {
        return {
          lists: [],
          isValid: false,
          errorMessage: `第 ${i + 1} 个元素必须是数组`,
        };
      }
      
      // 检查每个数组中的元素是否为数字
      for (let j = 0; j < parsed[i].length; j++) {
        const val = parsed[i][j];
        if (typeof val !== 'number' || !Number.isInteger(val)) {
          return {
            lists: [],
            isValid: false,
            errorMessage: `第 ${i + 1} 个链表的第 ${j + 1} 个元素必须是整数`,
          };
        }
        
        // 检查范围
        if (val < -10000 || val > 10000) {
          return {
            lists: [],
            isValid: false,
            errorMessage: `数值必须在 -10000 到 10000 之间`,
          };
        }
      }
      
      // 检查是否升序
      for (let j = 1; j < parsed[i].length; j++) {
        if (parsed[i][j] < parsed[i][j - 1]) {
          return {
            lists: [],
            isValid: false,
            errorMessage: `第 ${i + 1} 个链表必须是升序排列`,
          };
        }
      }
    }
    
    // 检查链表数量
    if (parsed.length > 10000) {
      return {
        lists: [],
        isValid: false,
        errorMessage: '链表数量不能超过 10000',
      };
    }
    
    // 检查总节点数
    const totalNodes = parsed.reduce((sum: number, list: number[]) => sum + list.length, 0);
    if (totalNodes > 10000) {
      return {
        lists: [],
        isValid: false,
        errorMessage: '节点总数不能超过 10000',
      };
    }
    
    return {
      lists: parsed,
      isValid: true,
    };
  } catch {
    return {
      lists: [],
      isValid: false,
      errorMessage: '输入格式错误，请使用JSON数组格式，如：[[1,4,5],[1,3,4],[2,6]]',
    };
  }
}

// 生成随机数据
export function generateRandomData(): number[][] {
  const listCount = Math.floor(Math.random() * 4) + 2; // 2-5个链表
  const lists: number[][] = [];
  
  for (let i = 0; i < listCount; i++) {
    const length = Math.floor(Math.random() * 5) + 1; // 1-5个节点
    const list: number[] = [];
    let prev = Math.floor(Math.random() * 10) - 5; // 起始值 -5 到 4
    
    for (let j = 0; j < length; j++) {
      list.push(prev);
      prev += Math.floor(Math.random() * 5) + 1; // 递增 1-5
    }
    
    lists.push(list);
  }
  
  return lists;
}

// 预设数据样例
export const presetExamples: { name: string; data: number[][]; desc: string }[] = [
  {
    name: '经典3链表交叉',
    data: [[1, 4, 5], [1, 3, 4], [2, 6]],
    desc: 'LeetCode经典示例：3个链表元素交叉分布，需要频繁比较切换',
  },
  {
    name: '双链表交替',
    data: [[1, 2, 4], [1, 3, 5]],
    desc: '基础示例：2个链表元素交替出现，适合理解合并过程',
  },
  {
    name: '单链表直通',
    data: [[1, 2, 3, 4, 5]],
    desc: '边界情况：只有1个链表，无需合并直接返回',
  },
  {
    name: '空数组',
    data: [],
    desc: '边界情况：输入为空数组，返回空结果',
  },
  {
    name: '含空链表',
    data: [[]],
    desc: '边界情况：包含空链表，需要正确处理空节点',
  },
  {
    name: '长度悬殊',
    data: [[1], [2, 3, 4, 5, 6, 7, 8]],
    desc: '特殊情况：链表长度差异大，短链表先耗尽',
  },
  {
    name: '多空链表混合',
    data: [[], [1, 2], [], [3, 4], []],
    desc: '复杂边界：多个空链表与非空链表混合',
  },
  {
    name: '负数链表',
    data: [[-5, -3, -1], [-4, -2, 0], [-6, 1, 2]],
    desc: '负数示例：包含负数的有序链表合并',
  },
];
