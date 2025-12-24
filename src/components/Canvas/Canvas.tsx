import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useStore } from '../../store/useStore';
import type { VisualNode, VisualEdge, Annotation } from '../../types';
import './Canvas.css';

// 颜色配置
const COLORS = {
  default: '#4A90A4',
  highlighted: '#E67E22',
  processed: '#27AE60',
  current: '#E74C3C',
  result: '#2ECC71',
  edge: '#718096',
  edgeHighlighted: '#E67E22',
  text: '#FFFFFF',
  annotation: {
    info: '#63b3ed',
    compare: '#f6ad55',
    move: '#68d391',
    result: '#48bb78',
  },
};

export function Canvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const { steps, playback } = useStore();
  
  const currentStep = steps[playback.currentStep];

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
      mainGroup.append('text')
        .attr('x', firstResultNode.x - 50)
        .attr('y', firstResultNode.y + 5)
        .attr('fill', '#48bb78')
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
      </div>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height - 40}
        className="canvas-svg"
      />
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

  // 节点圆形
  nodeGroup.append('circle')
    .attr('r', 22)
    .attr('fill', d => getNodeColor(d, isResult))
    .attr('stroke', d => d.isCurrent ? COLORS.current : (d.isHighlighted ? COLORS.highlighted : '#4a5568'))
    .attr('stroke-width', d => (d.isCurrent || d.isHighlighted) ? 3 : 1.5)
    .style('filter', d => (d.isCurrent || d.isHighlighted) ? 'drop-shadow(0 0 8px rgba(99, 179, 237, 0.5))' : 'none');

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
    .attr('fill', COLORS.annotation.info)
    .attr('font-size', '11px')
    .text(d => d.label || '');
}

// 获取节点颜色
function getNodeColor(node: VisualNode, isResult: boolean): string {
  if (isResult) return COLORS.result;
  if (node.isCurrent) return COLORS.current;
  if (node.isHighlighted) return COLORS.highlighted;
  if (node.isProcessed) return COLORS.processed;
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
    .attr('fill', isResult ? COLORS.result : COLORS.edge);

  edges.forEach(edge => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    
    if (!source || !target) return;

    group.append('line')
      .attr('x1', source.x + 22)
      .attr('y1', source.y)
      .attr('x2', target.x - 22)
      .attr('y2', target.y)
      .attr('stroke', edge.isHighlighted ? COLORS.edgeHighlighted : (isResult ? COLORS.result : COLORS.edge))
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
