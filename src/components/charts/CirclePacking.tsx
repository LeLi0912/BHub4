'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { TreemapItem } from '@/types';

interface CirclePackingProps {
  data: TreemapItem[];
}

export default function CirclePacking({ data }: CirclePackingProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(() => {
    if (!svgRef.current || !data.length) return;

    const width = svgRef.current.clientWidth || 400;
    const height = 320;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // --- Defs: gradients and filters ---
    const defs = svg.append('defs');

    // Per-bubble radial gradient
    data.forEach((d, i) => {
      const grad = defs.append('radialGradient')
        .attr('id', `pack-grad-${i}`)
        .attr('cx', '35%')
        .attr('cy', '35%')
        .attr('r', '65%');

      grad.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d.color)
        .attr('stop-opacity', 0.95);

      grad.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d.color)
        .attr('stop-opacity', 0.55);
    });

    // Drop shadow filter
    const shadowFilter = defs.append('filter')
      .attr('id', 'pack-shadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    shadowFilter.append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 3)
      .attr('stdDeviation', 5)
      .attr('flood-color', '#000')
      .attr('flood-opacity', 0.3);

    // Glow ring filter (for hover)
    const glowFilter = defs.append('filter')
      .attr('id', 'pack-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', 4)
      .attr('result', 'blur');

    const glowMerge = glowFilter.append('feMerge');
    glowMerge.append('feMergeNode').attr('in', 'blur');
    glowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // --- Hierarchy & pack layout ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root = d3.hierarchy({ children: data } as any)
      .sum((d: any) => d.value)
      .sort((a: any, b: any) => b.value - a.value);

    d3.pack<any>()
      .size([width - 20, height - 20])
      .padding(8)
      (root);

    const leaves = root.leaves();

    // --- Groups ---
    const group = svg.selectAll('g')
      .data(leaves)
      .join('g')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer');

    // --- Parent background circle (if root has children) ---
    const cirRoot = root as unknown as d3.HierarchyCircularNode<any>;
    if (cirRoot.children && cirRoot.children.length > 0) {
      svg.insert('circle', ':first-child')
        .attr('cx', cirRoot.x)
        .attr('cy', cirRoot.y)
        .attr('r', cirRoot.r)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255,255,255,0.08)')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 4');
    }

    // --- Circles ---
    group.append('circle')
      .attr('r', 0)
      .attr('fill', (_d: any, i: number) => `url(#pack-grad-${i})`)
      .attr('filter', 'url(#pack-shadow)')
      .on('mouseenter', function () {
        d3.select(this)
          .interrupt()
          .transition()
          .duration(200)
          .ease(d3.easeBackOut)
          .attr('r', (d: any) => (d as any).r * 1.08)
          .attr('filter', 'url(#pack-glow)')
          .attr('opacity', 1);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .interrupt()
          .transition()
          .duration(250)
          .ease(d3.easeBackOut)
          .attr('r', (d: any) => (d as any).r)
          .attr('filter', 'url(#pack-shadow)')
          .attr('opacity', 0.85);
      })
      .transition()
      .delay((_d: any, i: number) => i * 80)
      .duration(700)
      .ease(d3.easeElasticOut)
      .attr('r', (d: any) => d.r);

    // --- Labels (only for circles large enough) ---
    const labelGroup = group.filter((d: any) => d.r >= 25);

    labelGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.35em')
      .attr('fill', '#fff')
      .attr('font-size', (d: any) => Math.min(d.r / 3.5, 15))
      .attr('font-weight', '700')
      .attr('pointer-events', 'none')
      .style('opacity', 0)
      .transition()
      .delay((_d: any, i: number) => i * 80 + 350)
      .duration(400)
      .style('opacity', 1)
      .text((d: any) => d.data.name);

    labelGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('fill', '#fff')
      .attr('font-size', (d: any) => Math.min(d.r / 4.5, 12))
      .attr('font-weight', '500')
      .attr('opacity', 0)
      .attr('pointer-events', 'none')
      .transition()
      .delay((_d: any, i: number) => i * 80 + 450)
      .duration(400)
      .attr('opacity', 0.75)
      .text((d: any) => d.data.value);
  }, [data]);

  useEffect(() => {
    draw();
    const observer = new ResizeObserver(draw);
    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, [draw]);

  return <svg ref={svgRef} className="w-full" style={{ minHeight: '320px' }} />;
}
