import type { AlgorithmType } from '../../types';
import './AlgorithmModal.css';

interface AlgorithmModalProps {
  algorithmType: AlgorithmType;
  algorithmName: string;
  onClose: () => void;
}

// 顺序合并算法内容
function SequentialContent() {
  return (
    <div className="algorithm-content">
      <section className="content-section">
        <h3 className="section-title">📌 核心思想</h3>
        <p className="section-text">
          顺序合并是最直观、最容易理解的方法。核心思路是：<strong>将问题分解为多次"合并两个有序链表"的操作</strong>。
        </p>
        <div className="highlight-box">
          <p>就像整理扑克牌：先把第一副和第二副合并，再把结果和第三副合并，以此类推...</p>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">🎯 算法思路</h3>
        <div className="key-insight">
          <span className="insight-label">关键洞察</span>
          <p>合并 K 个链表 = 重复执行 K-1 次"合并两个链表"</p>
        </div>
        <p className="section-text">
          我们用一个变量 <code>ans</code> 来维护已合并的结果。初始时 <code>ans</code> 为空，
          然后依次将每个链表合并到 <code>ans</code> 中。
        </p>
      </section>

      <section className="content-section">
        <h3 className="section-title">📋 详细步骤</h3>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>初始化结果</h4>
              <ul>
                <li>设置 <code>ans = null</code>（空链表）</li>
                <li>准备遍历所有 K 个链表</li>
              </ul>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>循环合并</h4>
              <ul>
                <li>第 i 轮：将 <code>lists[i]</code> 与 <code>ans</code> 合并</li>
                <li>合并结果存回 <code>ans</code></li>
                <li>重复直到所有链表都被合并</li>
              </ul>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>两链表合并（子过程）</h4>
              <ul>
                <li>比较两个链表的头节点</li>
                <li>较小的节点加入结果，指针后移</li>
                <li>重复直到一个链表为空</li>
                <li>将剩余部分直接追加到结果末尾</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">💡 为什么这样做是正确的？</h3>
        <ul className="reason-list">
          <li><span className="bullet">•</span> 每次合并两个有序链表，结果仍然是有序的</li>
          <li><span className="bullet">•</span> 通过归纳：合并 1 个链表是有序的，合并 2 个是有序的...</li>
          <li><span className="bullet">•</span> 最终合并 K 个链表的结果也是有序的</li>
        </ul>
      </section>

      <section className="content-section">
        <h3 className="section-title">⏱️ 复杂度分析</h3>
        <div className="complexity-grid">
          <div className="complexity-item">
            <div className="complexity-label">时间复杂度</div>
            <div className="complexity-value">O(k²n)</div>
            <div className="complexity-explain">
              <ul>
                <li>第 1 轮合并：处理 n 个节点</li>
                <li>第 2 轮合并：处理 2n 个节点</li>
                <li>...</li>
                <li>第 k 轮合并：处理 kn 个节点</li>
                <li>总计：n + 2n + ... + kn = O(k²n)</li>
              </ul>
            </div>
          </div>
          <div className="complexity-item">
            <div className="complexity-label">空间复杂度</div>
            <div className="complexity-value">O(1)</div>
            <div className="complexity-explain">
              <ul>
                <li>只使用了常数个指针变量</li>
                <li>不需要额外的数据结构</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">⚠️ 优缺点</h3>
        <div className="pros-cons">
          <div className="pros">
            <h4>✅ 优点</h4>
            <ul>
              <li>实现简单，容易理解</li>
              <li>空间复杂度最优 O(1)</li>
              <li>适合链表数量较少的情况</li>
            </ul>
          </div>
          <div className="cons">
            <h4>❌ 缺点</h4>
            <ul>
              <li>时间复杂度较高 O(k²n)</li>
              <li>前面的元素被重复比较多次</li>
              <li>链表数量多时效率低下</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">✨ 面试技巧</h3>
        <div className="tip-box">
          <p>
            顺序合并是最基础的解法，面试时可以先说这个方法展示你的思路，
            然后再优化到分治或优先队列方法，展示你的算法优化能力。
          </p>
        </div>
      </section>
    </div>
  );
}

// 分治合并算法内容
function DivideConquerContent() {
  return (
    <div className="algorithm-content">
      <section className="content-section">
        <h3 className="section-title">📌 核心思想</h3>
        <p className="section-text">
          分治法的核心是<strong>"分而治之"</strong>：将大问题分解为小问题，解决小问题后再合并结果。
        </p>
        <div className="highlight-box">
          <p>就像归并排序：先把数组分成两半分别排序，再合并两个有序数组。</p>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">🎯 算法思路</h3>
        <div className="key-insight">
          <span className="insight-label">关键洞察</span>
          <p>将 K 个链表两两配对合并，每轮合并后链表数量减半，logK 轮后得到最终结果</p>
        </div>
        <p className="section-text">
          与顺序合并不同，分治法每次将链表数组从中间分开，左右两边分别递归处理，
          最后将两个结果合并。这样避免了前面元素被重复比较的问题。
        </p>
      </section>

      <section className="content-section">
        <h3 className="section-title">📋 详细步骤</h3>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>分割（Divide）</h4>
              <ul>
                <li>计算中点 <code>mid = (left + right) / 2</code></li>
                <li>将链表数组分成 <code>[left, mid]</code> 和 <code>[mid+1, right]</code></li>
              </ul>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>递归（Conquer）</h4>
              <ul>
                <li>递归处理左半部分，得到一个有序链表</li>
                <li>递归处理右半部分，得到一个有序链表</li>
                <li>基本情况：只有一个链表时直接返回</li>
              </ul>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>合并（Merge）</h4>
              <ul>
                <li>将左右两个有序链表合并为一个</li>
                <li>使用"合并两个有序链表"的标准算法</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">🌳 递归树示意</h3>
        <div className="tree-diagram">
          <pre>{`
        [L1, L2, L3, L4]          第0层：4个链表
           /        \\
    [L1, L2]      [L3, L4]        第1层：2组，每组2个
      /   \\        /   \\
    L1    L2     L3    L4         第2层：4组，每组1个（基本情况）
      \\   /        \\   /
      合并          合并           向上合并
         \\        /
          最终结果                 得到答案
          `}</pre>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">💡 为什么比顺序合并更快？</h3>
        <ul className="reason-list">
          <li><span className="bullet">•</span> 顺序合并：第 i 轮需要处理前 i 个链表的所有节点</li>
          <li><span className="bullet">•</span> 分治合并：每个节点只在 logK 层中各被处理一次</li>
          <li><span className="bullet">•</span> 避免了前面元素被重复比较的问题</li>
        </ul>
      </section>

      <section className="content-section">
        <h3 className="section-title">⏱️ 复杂度分析</h3>
        <div className="complexity-grid">
          <div className="complexity-item">
            <div className="complexity-label">时间复杂度</div>
            <div className="complexity-value">O(kn·logk)</div>
            <div className="complexity-explain">
              <ul>
                <li>递归深度：logK 层</li>
                <li>每层处理：所有 kn 个节点各一次</li>
                <li>总计：O(kn·logk)</li>
              </ul>
            </div>
          </div>
          <div className="complexity-item">
            <div className="complexity-label">空间复杂度</div>
            <div className="complexity-value">O(logk)</div>
            <div className="complexity-explain">
              <ul>
                <li>递归调用栈的深度</li>
                <li>每层只需要常数空间</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">✨ 面试技巧</h3>
        <div className="tip-box">
          <p>
            分治法展示了你对递归和分治思想的理解。面试时可以画出递归树来解释，
            并与顺序合并对比说明为什么时间复杂度更优。
          </p>
        </div>
      </section>
    </div>
  );
}


// 优先队列算法内容
function PriorityQueueContent() {
  return (
    <div className="algorithm-content">
      <section className="content-section">
        <h3 className="section-title">📌 核心思想</h3>
        <p className="section-text">
          优先队列（最小堆）是一种特殊的数据结构，能够在 <code>O(logk)</code> 时间内找到并取出最小元素。
          利用这个特性，我们可以高效地从 K 个链表中找到当前最小的节点。
        </p>
        <div className="highlight-box">
          <p>就像有 K 个排好队的队伍，我们需要一个"裁判"来快速找出所有队伍最前面的人中最矮的那个。</p>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">🎯 算法思路</h3>
        <div className="key-insight">
          <span className="insight-label">关键洞察</span>
          <p>在任意时刻，下一个应该加入结果的节点，一定是所有链表当前头节点中最小的那个</p>
        </div>
        <p className="section-text">
          我们不需要比较所有节点，只需要维护每个链表的"候选节点"（当前头节点），
          然后从这 K 个候选中选最小的即可。最小堆正好能高效完成这个任务！
        </p>
      </section>

      <section className="content-section">
        <h3 className="section-title">📋 详细步骤</h3>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>初始化最小堆</h4>
              <ul>
                <li>创建一个最小堆（优先队列）</li>
                <li>将每个非空链表的头节点加入堆中</li>
                <li>此时堆中最多有 K 个元素</li>
              </ul>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>循环取出最小值</h4>
              <ul>
                <li>从堆顶取出最小节点（<code>O(logk)</code>）</li>
                <li>将该节点加入结果链表</li>
              </ul>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>补充新的候选节点</h4>
              <ul>
                <li>如果取出的节点还有下一个节点</li>
                <li>将下一个节点加入堆中（<code>O(logk)</code>）</li>
                <li>这样保证该链表始终有一个代表在堆中</li>
              </ul>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>重复直到堆为空</h4>
              <ul>
                <li>当堆为空时，所有节点都已处理完毕</li>
                <li>结果链表就是最终答案</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">🔍 堆的工作原理</h3>
        <div className="heap-diagram">
          <div className="heap-visual">
            <pre>{`
    最小堆示意图（堆顶最小）
    
         1          <- 堆顶，全局最小
        / \\
       3   2        <- 第二层
      / \\
     5   4          <- 第三层
     
    每次取出堆顶后，堆会自动调整
    保证新的堆顶仍是最小值
            `}</pre>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">💡 为什么这样做是正确的？</h3>
        <ul className="reason-list">
          <li><span className="bullet">•</span> 堆中始终保存每个链表的"最前面"的未处理节点</li>
          <li><span className="bullet">•</span> 由于每个链表本身有序，最前面的一定是该链表最小的</li>
          <li><span className="bullet">•</span> 堆顶是所有候选中最小的，也就是全局最小的</li>
          <li><span className="bullet">•</span> 因此每次取堆顶都能保证结果链表的有序性</li>
        </ul>
      </section>

      <section className="content-section">
        <h3 className="section-title">⏱️ 复杂度分析</h3>
        <div className="complexity-grid">
          <div className="complexity-item">
            <div className="complexity-label">时间复杂度</div>
            <div className="complexity-value">O(kn·logk)</div>
            <div className="complexity-explain">
              <ul>
                <li>总共有 kn 个节点需要处理</li>
                <li>每个节点入堆和出堆各一次</li>
                <li>堆操作的时间复杂度是 <code>O(logk)</code></li>
                <li>总计：<code>O(kn·logk)</code></li>
              </ul>
            </div>
          </div>
          <div className="complexity-item">
            <div className="complexity-label">空间复杂度</div>
            <div className="complexity-value">O(k)</div>
            <div className="complexity-explain">
              <ul>
                <li>堆中最多同时存在 K 个节点</li>
                <li>每个链表最多有一个节点在堆中</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">🔄 与其他方法对比</h3>
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>方法</th>
                <th>时间复杂度</th>
                <th>空间复杂度</th>
                <th>特点</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>顺序合并</td>
                <td>O(k²n)</td>
                <td>O(1)</td>
                <td>简单但效率低</td>
              </tr>
              <tr>
                <td>分治合并</td>
                <td>O(kn·logk)</td>
                <td>O(logk)</td>
                <td>递归实现</td>
              </tr>
              <tr className="highlight-row">
                <td>优先队列</td>
                <td>O(kn·logk)</td>
                <td>O(k)</td>
                <td>迭代实现，更直观</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">✨ 面试技巧</h3>
        <div className="tip-box">
          <p>
            这是面试中的<strong>最优解法之一</strong>，展示了对堆数据结构的熟练运用。
            关键是理解"维护 K 个候选节点"的思想。面试时可以：
          </p>
          <ul>
            <li>先解释为什么需要优先队列（快速找最小值）</li>
            <li>说明堆中元素的含义（每个链表的当前候选）</li>
            <li>分析时间复杂度时强调每个节点只入堆出堆各一次</li>
          </ul>
        </div>
      </section>

      <section className="content-section">
        <h3 className="section-title">🎓 延伸思考</h3>
        <div className="extension-box">
          <p><strong>Q: 为什么不直接把所有节点放入堆中？</strong></p>
          <p>
            A: 那样堆的大小会是 kn，每次操作是 <code>O(log(kn))</code>，
            总时间复杂度变成 <code>O(kn·log(kn))</code>，比当前方法差。
            而且空间复杂度也会变成 <code>O(kn)</code>。
          </p>
        </div>
      </section>
    </div>
  );
}

export function AlgorithmModal({ algorithmType, algorithmName, onClose }: AlgorithmModalProps) {
  const renderContent = () => {
    switch (algorithmType) {
      case 'sequential':
        return <SequentialContent />;
      case 'divideConquer':
        return <DivideConquerContent />;
      case 'priorityQueue':
        return <PriorityQueueContent />;
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="algorithm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{algorithmName} - 算法思路</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
