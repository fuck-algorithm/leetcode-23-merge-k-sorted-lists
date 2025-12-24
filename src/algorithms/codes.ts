import type { AlgorithmType, CodeLanguage } from '../types';

// 顺序合并算法代码
const sequentialCode = {
  java: `// 顺序合并 - Java
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        ListNode ans = null;
        for (int i = 0; i < lists.length; i++) {
            ans = mergeTwoLists(ans, lists[i]);
        }
        return ans;
    }
    
    private ListNode mergeTwoLists(ListNode a, ListNode b) {
        if (a == null || b == null) {
            return a != null ? a : b;
        }
        ListNode head = new ListNode(0);
        ListNode tail = head;
        ListNode aPtr = a, bPtr = b;
        while (aPtr != null && bPtr != null) {
            if (aPtr.val < bPtr.val) {
                tail.next = aPtr;
                aPtr = aPtr.next;
            } else {
                tail.next = bPtr;
                bPtr = bPtr.next;
            }
            tail = tail.next;
        }
        tail.next = aPtr != null ? aPtr : bPtr;
        return head.next;
    }
}`,
  python: `# 顺序合并 - Python
class Solution:
    def mergeKLists(self, lists: List[ListNode]) -> ListNode:
        ans = None
        for i in range(len(lists)):
            ans = self.mergeTwoLists(ans, lists[i])
        return ans
    
    def mergeTwoLists(self, a: ListNode, b: ListNode) -> ListNode:
        if not a or not b:
            return a if a else b
        head = ListNode(0)
        tail = head
        aPtr, bPtr = a, b
        while aPtr and bPtr:
            if aPtr.val < bPtr.val:
                tail.next = aPtr
                aPtr = aPtr.next
            else:
                tail.next = bPtr
                bPtr = bPtr.next
            tail = tail.next
        tail.next = aPtr if aPtr else bPtr
        return head.next`,
  golang: `// 顺序合并 - Go
func mergeKLists(lists []*ListNode) *ListNode {
    var ans *ListNode
    for i := 0; i < len(lists); i++ {
        ans = mergeTwoLists(ans, lists[i])
    }
    return ans
}

func mergeTwoLists(a, b *ListNode) *ListNode {
    if a == nil || b == nil {
        if a != nil {
            return a
        }
        return b
    }
    head := &ListNode{}
    tail := head
    aPtr, bPtr := a, b
    for aPtr != nil && bPtr != nil {
        if aPtr.Val < bPtr.Val {
            tail.Next = aPtr
            aPtr = aPtr.Next
        } else {
            tail.Next = bPtr
            bPtr = bPtr.Next
        }
        tail = tail.Next
    }
    if aPtr != nil {
        tail.Next = aPtr
    } else {
        tail.Next = bPtr
    }
    return head.Next
}`,
  javascript: `// 顺序合并 - JavaScript
var mergeKLists = function(lists) {
    let ans = null;
    for (let i = 0; i < lists.length; i++) {
        ans = mergeTwoLists(ans, lists[i]);
    }
    return ans;
};

var mergeTwoLists = function(a, b) {
    if (!a || !b) {
        return a ? a : b;
    }
    const head = new ListNode(0);
    let tail = head;
    let aPtr = a, bPtr = b;
    while (aPtr && bPtr) {
        if (aPtr.val < bPtr.val) {
            tail.next = aPtr;
            aPtr = aPtr.next;
        } else {
            tail.next = bPtr;
            bPtr = bPtr.next;
        }
        tail = tail.next;
    }
    tail.next = aPtr ? aPtr : bPtr;
    return head.next;
};`,
};

// 分治合并算法代码
const divideConquerCode = {
  java: `// 分治合并 - Java
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        return merge(lists, 0, lists.length - 1);
    }
    
    private ListNode merge(ListNode[] lists, int l, int r) {
        if (l == r) return lists[l];
        if (l > r) return null;
        int mid = (l + r) >> 1;
        return mergeTwoLists(
            merge(lists, l, mid),
            merge(lists, mid + 1, r)
        );
    }
    
    private ListNode mergeTwoLists(ListNode a, ListNode b) {
        if (a == null || b == null) {
            return a != null ? a : b;
        }
        ListNode head = new ListNode(0);
        ListNode tail = head;
        while (a != null && b != null) {
            if (a.val < b.val) {
                tail.next = a;
                a = a.next;
            } else {
                tail.next = b;
                b = b.next;
            }
            tail = tail.next;
        }
        tail.next = a != null ? a : b;
        return head.next;
    }
}`,
  python: `# 分治合并 - Python
class Solution:
    def mergeKLists(self, lists: List[ListNode]) -> ListNode:
        if not lists:
            return None
        return self.merge(lists, 0, len(lists) - 1)
    
    def merge(self, lists, l, r):
        if l == r:
            return lists[l]
        if l > r:
            return None
        mid = (l + r) // 2
        return self.mergeTwoLists(
            self.merge(lists, l, mid),
            self.merge(lists, mid + 1, r)
        )
    
    def mergeTwoLists(self, a, b):
        if not a or not b:
            return a if a else b
        head = ListNode(0)
        tail = head
        while a and b:
            if a.val < b.val:
                tail.next = a
                a = a.next
            else:
                tail.next = b
                b = b.next
            tail = tail.next
        tail.next = a if a else b
        return head.next`,
  golang: `// 分治合并 - Go
func mergeKLists(lists []*ListNode) *ListNode {
    return merge(lists, 0, len(lists)-1)
}

func merge(lists []*ListNode, l, r int) *ListNode {
    if l == r {
        return lists[l]
    }
    if l > r {
        return nil
    }
    mid := (l + r) >> 1
    return mergeTwoLists(
        merge(lists, l, mid),
        merge(lists, mid+1, r),
    )
}

func mergeTwoLists(a, b *ListNode) *ListNode {
    if a == nil || b == nil {
        if a != nil {
            return a
        }
        return b
    }
    head := &ListNode{}
    tail := head
    for a != nil && b != nil {
        if a.Val < b.Val {
            tail.Next = a
            a = a.Next
        } else {
            tail.Next = b
            b = b.Next
        }
        tail = tail.Next
    }
    if a != nil {
        tail.Next = a
    } else {
        tail.Next = b
    }
    return head.Next
}`,
  javascript: `// 分治合并 - JavaScript
var mergeKLists = function(lists) {
    return merge(lists, 0, lists.length - 1);
};

var merge = function(lists, l, r) {
    if (l === r) return lists[l];
    if (l > r) return null;
    const mid = (l + r) >> 1;
    return mergeTwoLists(
        merge(lists, l, mid),
        merge(lists, mid + 1, r)
    );
};

var mergeTwoLists = function(a, b) {
    if (!a || !b) return a ? a : b;
    const head = new ListNode(0);
    let tail = head;
    while (a && b) {
        if (a.val < b.val) {
            tail.next = a;
            a = a.next;
        } else {
            tail.next = b;
            b = b.next;
        }
        tail = tail.next;
    }
    tail.next = a ? a : b;
    return head.next;
};`,
};

// 优先队列算法代码
const priorityQueueCode = {
  java: `// 优先队列 - Java
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>(
            (a, b) -> a.val - b.val
        );
        for (ListNode node : lists) {
            if (node != null) {
                pq.offer(node);
            }
        }
        ListNode head = new ListNode(0);
        ListNode tail = head;
        while (!pq.isEmpty()) {
            ListNode node = pq.poll();
            tail.next = node;
            tail = tail.next;
            if (node.next != null) {
                pq.offer(node.next);
            }
        }
        return head.next;
    }
}`,
  python: `# 优先队列 - Python
import heapq

class Solution:
    def mergeKLists(self, lists: List[ListNode]) -> ListNode:
        heap = []
        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i))
                lists[i] = node.next
        
        head = ListNode(0)
        tail = head
        while heap:
            val, idx = heapq.heappop(heap)
            tail.next = ListNode(val)
            tail = tail.next
            if lists[idx]:
                heapq.heappush(heap, (lists[idx].val, idx))
                lists[idx] = lists[idx].next
        
        return head.next`,
  golang: `// 优先队列 - Go
import "container/heap"

type MinHeap []*ListNode

func (h MinHeap) Len() int           { return len(h) }
func (h MinHeap) Less(i, j int) bool { return h[i].Val < h[j].Val }
func (h MinHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *MinHeap) Push(x any)        { *h = append(*h, x.(*ListNode)) }
func (h *MinHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

func mergeKLists(lists []*ListNode) *ListNode {
    h := &MinHeap{}
    heap.Init(h)
    for _, node := range lists {
        if node != nil {
            heap.Push(h, node)
        }
    }
    head := &ListNode{}
    tail := head
    for h.Len() > 0 {
        node := heap.Pop(h).(*ListNode)
        tail.Next = node
        tail = tail.Next
        if node.Next != nil {
            heap.Push(h, node.Next)
        }
    }
    return head.Next
}`,
  javascript: `// 优先队列 - JavaScript
// 使用最小堆实现
class MinHeap {
    constructor() {
        this.heap = [];
    }
    push(val) {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0) return null;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return min;
    }
    bubbleUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.heap[parent].val <= this.heap[i].val) break;
            [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
            i = parent;
        }
    }
    bubbleDown(i) {
        while (true) {
            let min = i;
            const left = 2 * i + 1, right = 2 * i + 2;
            if (left < this.heap.length && this.heap[left].val < this.heap[min].val) min = left;
            if (right < this.heap.length && this.heap[right].val < this.heap[min].val) min = right;
            if (min === i) break;
            [this.heap[min], this.heap[i]] = [this.heap[i], this.heap[min]];
            i = min;
        }
    }
    isEmpty() { return this.heap.length === 0; }
}

var mergeKLists = function(lists) {
    const pq = new MinHeap();
    for (const node of lists) {
        if (node) pq.push(node);
    }
    const head = new ListNode(0);
    let tail = head;
    while (!pq.isEmpty()) {
        const node = pq.pop();
        tail.next = node;
        tail = tail.next;
        if (node.next) pq.push(node.next);
    }
    return head.next;
};`,
};

export const algorithmCodes: Record<AlgorithmType, Record<CodeLanguage, string>> = {
  sequential: sequentialCode,
  divideConquer: divideConquerCode,
  priorityQueue: priorityQueueCode,
};

export const algorithmNames: Record<AlgorithmType, string> = {
  sequential: '顺序合并',
  divideConquer: '分治合并',
  priorityQueue: '优先队列',
};

export const algorithmDescriptions: Record<AlgorithmType, string> = {
  sequential: `顺序合并是最直观的方法：
1. 用一个变量 ans 来维护已合并的链表
2. 第 i 次循环把第 i 个链表和 ans 合并
3. 答案保存到 ans 中

时间复杂度：O(k²n)，其中 k 是链表数量，n 是平均长度
空间复杂度：O(1)`,
  divideConquer: `分治合并利用分治思想优化：
1. 将 k 个链表配对并将同一对中的链表合并
2. 第一轮合并后，k 个链表被合并成 k/2 个
3. 重复这一过程，直到得到最终的有序链表

时间复杂度：O(kn × logk)
空间复杂度：O(logk)，递归栈空间`,
  priorityQueue: `优先队列方法维护当前每个链表的最小元素：
1. 将每个链表的头节点加入优先队列
2. 每次取出最小的节点加入结果链表
3. 如果该节点有下一个节点，将其加入队列

时间复杂度：O(kn × logk)
空间复杂度：O(k)，优先队列大小`,
};
