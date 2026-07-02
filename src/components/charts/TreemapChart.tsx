'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { TreemapItem } from '@/types';

interface TreemapProps {
  data: TreemapItem[];
  lang?: string;
}

export default function TreemapChart({ data }: TreemapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(() => {
    if (!svgRef.current || !data.length) return;

    const width = svgRef.current.clientWidth || 400;
    const height = 280;
    const margin = 4;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root = d3.hierarchy({ children: data } as any)
      .sum((d: any) => d.value)
      .sort((a: any, b: any) => b.value - a.value);

    d3.treemap<any>()
      .size([width, height])
      .paddingOuter(margin)
      .paddingInner(2)
      .round(true)
      (root);

    const leaf = svg
      .selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    // Rect
    leaf
      .append('rect')
      .attr('fill', (d: any) => d.data.color + 'CC')
      .attr('fill-opacity', 0.85)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('rx', 4)
      .attr('ry', 4)
      .on('mouseenter', function () {
        d3.select(this).attr('fill-opacity', 1);
      })
      .on('mouseleave', function () {
        d3.select(this).attr('fill-opacity', 0.85);
      });

    // Label
    leaf
      .append('text')
      .selectAll('tspan')
      .data((d: any) => {
        const name = d.data.name;
        const sub = d.data.sub || '';
        const w = d.x1 - d.x0;
        const maxChars = Math.max(1, Math.floor(w / 8));
        const truncated = name.length > maxChars ? name.slice(0, maxChars - 1) + '…' : name;
        return [truncated, sub];
      })
      .join('tspan')
      .attr('x', 6)
      .attr('y', (_d: any, i: number) => 16 + i * 16)
      .attr('fill', '#fff')
      .attr('font-size', (d: string, i: number) => i === 0 ? '13px' : '10px')
      .attr('font-weight', (_d: string, i: number) => i === 0 ? '600' : '400')
      .attr('opacity', (_d: string, i: number) => i === 0 ? 1 : 0.8)
      .text((d: string) => d);

    // Value
    leaf
      .append('text')
      .attr('x', (d: any) => (d.x1 - d.x0) - 6)
      .attr('y', (d: any) => (d.y1 - d.y0) - 6)
      .attr('fill', '#fff')
      .attr('font-size', '18px')
      .attr('font-weight', '700')
      .attr('text-anchor', 'end')
      .attr('opacity', 0.6)
      .text((d: any) => d.data.value);
  }, [data]);

  useEffect(() => {
    draw();
    const observer = new ResizeObserver(draw);
    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, [draw]);

  return <svg ref={svgRef} className="w-full" style={{ minHeight: '280px' }} />;
}
