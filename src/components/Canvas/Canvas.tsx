import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useStore } from '../../store/useStore';
import type { VisualNode, VisualEdge, Annotation } from '../../types';
import './Canvas.css';

// 颜色配置 - 优化配色方案，让正在合并的两个链表更容易区分
const COLORS = {
  default: '#4A90A4',        // 默认蓝色 - 未处理的链表
  highlighted: '#F59E0B',    // 橙黄色 - 当前正在合并的B链表
  processed: '#374151',      // 深灰色 - 已处理完的链表（更暗）
  current: '#EF4444',        // 红色 - 当前指针指向的节点
  result: '#10B981',         // 绿色 - 结果链表（非合并状态）
  mergingA: '#A855F7',       // 亮紫色 - 正在合并的A链表（ans链表）- 更鲜艳
  mergingB: '#FB923C',       // 亮橙色 - 正在合并的B链表（当前链表）- 更鲜艳
  pending: '#94A3B8',        // 浅灰色 - 待处理的链表（更淡，降低视觉权重）
  edge: '#718096',
  edgeHighlighted: '#FB923C',
  edgeMergingA: '#A855F7',   // 紫色边 - A链表的边
  edgeMergingB: '#FB923C',   // 橙色边 - B链表的边
  text: '#FFFFFF',
  annotation: {
    info: '#63b3ed',
    compare: '#f6ad55',
    move: '#68d391',
    result: '#48bb78',
  },
};

// 图例配置 - 用于解释各种颜色的含义
const LEGEND_ITEMS = [
  { color: COLORS.mergingA, label: '🟣 A链表 (ans)', description: '正在合并的结果链表' },
  { color: COLORS.mergingB, label: '🟠 B链表', description: '正在合并的当前链表' },
  { color: COLORS.current, label: '🔴 当前指针', description: '正在比较的节点' },
  { color: COLORS.pending, label: '⚪ 待处理', description: '等待合并的链表' },
  { color: COLORS.processed, label: '⬛ 已完成', description: '已合并完成的链表' },
  { color: COLORS.result, label: '🟢 结果', description: '最终合并结果' },
];

export function Canvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [showLegend, setShowLegend] = useState(true);
  const { steps, playback, algorithmType } = useStore();
  
  const currentStep = steps[playback.currentStep];
  
  // 检测当前是否处于合并状态（用于决定是否显示合并相关的图例项）
  const isMergingState = currentStep?.nodes.some(n => n.isMergingA || n.isMergingB) || 
                         currentStep?.resultNodes.some(n => n.isMergingA);

  // 更新尺寸
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 绘制画布
  useEffect(() => {
    if (!svgRef.current || !currentStep) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    
    // 创建缩放行为
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
      });

    svg.call(zoom);

    // 主绘图组
    const mainGroup = svg.append('g')
      .attr('class', 'main-group');

    // 计算居中偏移
    const allNodes = [...currentStep.nodes, ...currentStep.resultNodes];
    if (allNodes.length > 0) {
      const minX = Math.min(...allNodes.map(n => n.x));
      const maxX = Math.max(...allNodes.map(n => n.x));
      const minY = Math.min(...allNodes.map(n => n.y));
      const maxY = Math.max(...allNodes.map(n => n.y));
      
      const contentWidth = maxX - minX + 100;
      const contentHeight = maxY - minY + 100;
      
      const offsetX = (width - contentWidth) / 2 - minX + 50;
      const offsetY = (height - contentHeight) / 2 - minY + 50;
      
      mainGroup.attr('transform', `translate(${offsetX}, ${offsetY})`);
    }

    // 绘制输入链表标签
    const listLabels = new Set(currentStep.nodes.map(n => n.listIndex));
    listLabels.forEach(listIndex => {
      const nodesInList = currentStep.nodes.filter(n => n.listIndex === listIndex);
      if (nodesInList.length > 0) {
        const firstNode = nodesInList[0];
        mainGroup.append('text')
          .attr('x', firstNode.x - 50)
          .attr('y', firstNode.y + 5)
          .attr('fill', '#718096')
          .attr('font-size', '12px')
          .text(`链表${listIndex + 1}:`);
      }
    });

    // 绘制边
    drawEdges(mainGroup, currentStep.edges, currentStep.nodes);
    drawEdges(mainGroup, currentStep.resultEdges, currentStep.resultNodes, true);

    // 绘制节点
    drawNodes(mainGroup, currentStep.nodes);
    drawNodes(mainGroup, currentStep.resultNodes, true);

    // 绘制结果链表标签
    if (currentStep.resultNodes.length > 0) {
      const firstResultNode = currentStep.resultNodes[0];
      // 如果结果链表正在参与合并，使用紫色；否则使用绿色
      const labelColor = firstResultNode.isMergingA ? COLORS.mergingA : COLORS.result;
      mainGroup.append('text')
        .attr('x', firstResultNode.x - 50)
        .attr('y', firstResultNode.y + 5)
        .attr('fill', labelColor)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('结果:');
    }

    // 绘制标注
    drawAnnotations(mainGroup, currentStep.annotations);

  }, [currentStep, dimensions]);

  return (
    <div className="canvas-container" ref={containerRef}>
      <div className="canvas-header">
        <span className="step-description">
          {currentStep?.description || '准备开始...'}
        </span>
        <button 
          className="legend-toggle"
          onClick={() => setShowLegend(!showLegend)}
          title={showLegend ? '隐藏图例' : '显示图例'}
        >
          {showLegend ? '🎨 隐藏图例' : '🎨 显示图例'}
        </button>
      </div>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height - 40}
        className="canvas-svg"
      />
      {/* 图例面板 */}
      {showLegend && algorithmType === 'sequential' && (
        <div className="canvas-legend">
          <div className="legend-title">配色说明</div>
          <div className="legend-items">
            {LEGEND_ITEMS.map((item, index) => {
              // 根据当前状态决定是否显示某些图例项
              // 合并状态时显示A/B链表，非合并状态时显示结果
              if (item.label.includes('A链表') || item.label.includes('B链表')) {
                if (!isMergingState) return null;
              }
              if (item.label.includes('结果') && isMergingState) {
                return null;
              }
              return (
                <div key={index} className="legend-item">
                  <span 
                    className="legend-color" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="legend-label">{item.label}</span>
                </div>
              );
            })}
          </div>
          {isMergingState && (
            <div className="legend-hint">
              💡 紫色=ans链表，橙色=当前合并链表
            </div>
          )}
        </div>
      )}
      <div className="canvas-hint">
        拖拽平移 · 滚轮缩放
      </div>
    </div>
  );
}

// 绘制节点
function drawNodes(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: VisualNode[],
  isResult = false
) {
  const nodeGroup = group.selectAll(isResult ? '.result-node' : '.input-node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', isResult ? 'result-node' : 'input-node')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  // 获取节点边框颜色
  const getStrokeColor = (d: VisualNode, isResult: boolean): string => {
    if (isResult) {
      // 结果链表在合并状态时使用紫色边框
      if (d.isMergingA) return COLORS.mergingA;
      if (d.isCurrent) return COLORS.current;
      return COLORS.result;
    }
    if (d.isCurrent) return COLORS.current;
    if (d.isMergingA) return COLORS.mergingA;
    if (d.isMergingB || d.isHighlighted) return COLORS.mergingB;
    // 待处理的链表使用更淡的边框
    if (d.isPending) return '#64748B';
    // 已处理的链表使用深灰边框
    if (d.isProcessed) return '#4B5563';
    return '#4a5568';
  };

  // 节点圆形
  nodeGroup.append('circle')
    .attr('r', 22)
    .attr('fill', d => getNodeColor(d, isResult))
    .attr('stroke', d => getStrokeColor(d, isResult))
    .attr('stroke-width', d => (d.isCurrent || d.isHighlighted || d.isMergingA || d.isMergingB) ? 3 : 1.5)
    .style('filter', d => (d.isCurrent || d.isHighlighted || d.isMergingA || d.isMergingB) ? 'drop-shadow(0 0 8px rgba(99, 179, 237, 0.5))' : 'none');

  // 节点值
  nodeGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('fill', COLORS.text)
    .attr('font-size', '14px')
    .attr('font-weight', '600')
    .text(d => d.val);

  // 节点标签
  nodeGroup.filter(d => !!d.label)
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', -32)
    .attr('fill', d => d.isMergingA ? COLORS.mergingA : (d.isMergingB ? COLORS.mergingB : COLORS.annotation.info))
    .attr('font-size', '11px')
    .text(d => d.label || '');
}

// 获取节点颜色 - 优化配色逻辑
function getNodeColor(node: VisualNode, isResult: boolean): string {
  // 结果链表的颜色处理
  if (isResult) {
    // 如果结果链表正在作为A链表参与合并，使用紫色
    if (node.isMergingA) return COLORS.mergingA;
    // 当前指针指向的节点用红色
    if (node.isCurrent) return COLORS.current;
    // 默认结果链表用绿色
    return COLORS.result;
  }
  
  // 输入链表的颜色处理
  if (node.isCurrent) return COLORS.current;
  // 正在合并的A链表（ans链表）- 紫色
  if (node.isMergingA) return COLORS.mergingA;
  // 正在合并的B链表（当前链表）- 橙色
  if (node.isMergingB || node.isHighlighted) return COLORS.mergingB;
  // 已处理完的链表 - 深灰色
  if (node.isProcessed) return COLORS.processed;
  // 待处理的链表 - 浅灰色（更淡）
  if (node.isPending) return COLORS.pending;
  return COLORS.default;
}

// 绘制边
function drawEdges(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  edges: VisualEdge[],
  nodes: VisualNode[],
  isResult = false
) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  // 检查结果链表是否处于合并状态
  const isMergingState = isResult && nodes.length > 0 && nodes[0].isMergingA;
  const resultColor = isMergingState ? COLORS.mergingA : COLORS.result;

  // 定义箭头
  const defs = group.append('defs');
  defs.append('marker')
    .attr('id', isResult ? 'arrow-result' : 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 28)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', isResult ? resultColor : COLORS.edge);

  edges.forEach(edge => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    
    if (!source || !target) return;

    group.append('line')
      .attr('x1', source.x + 22)
      .attr('y1', source.y)
      .attr('x2', target.x - 22)
      .attr('y2', target.y)
      .attr('stroke', edge.isHighlighted ? COLORS.edgeHighlighted : (isResult ? resultColor : COLORS.edge))
      .attr('stroke-width', edge.isHighlighted ? 3 : 2)
      .attr('marker-end', `url(#${isResult ? 'arrow-result' : 'arrow'})`);

    // 边标签
    if (edge.label) {
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2 - 10;
      
      group.append('text')
        .attr('x', midX)
        .attr('y', midY)
        .attr('text-anchor', 'middle')
        .attr('fill', COLORS.annotation.move)
        .attr('font-size', '10px')
        .text(edge.label);
    }
  });
}

// 绘制标注
function drawAnnotations(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  annotations: Annotation[]
) {
  annotations.forEach(annotation => {
    const annotationGroup = group.append('g')
      .attr('class', 'annotation')
      .attr('transform', `translate(${annotation.x}, ${annotation.y})`);

    // 背景
    const text = annotationGroup.append('text')
      .attr('fill', COLORS.annotation[annotation.type])
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text(annotation.text);

    const bbox = (text.node() as SVGTextElement).getBBox();
    
    annotationGroup.insert('rect', 'text')
      .attr('x', bbox.x - 4)
      .attr('y', bbox.y - 2)
      .attr('width', bbox.width + 8)
      .attr('height', bbox.height + 4)
      .attr('fill', 'rgba(26, 26, 46, 0.9)')
      .attr('rx', 4);
  });
}
