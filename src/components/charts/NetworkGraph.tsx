'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { NetworkData, Tool, Paper, Algorithm } from '@/types';
import { useI18n } from '@/lib/i18n';

interface NetworkGraphProps {
  network: NetworkData;
  tools: Tool[];
  papers: Paper[];
  algorithms: Algorithm[];
}

interface TooltipState {
  x: number;
  y: number;
  content: { name: string; summary: string };
}

export default function NetworkGraph({ network, tools, papers, algorithms }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { lang, t } = useI18n();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Build a lookup map for descriptions
  const buildDescriptionMap = useCallback(() => {
    const map = new Map<string, string>();

    // Match tool nodes by name (case-insensitive)
    network.nodes.forEach((node) => {
      if (node.group === 'tool') {
        const tool = tools.find(
          (t) => t.name.toLowerCase() === node.label.toLowerCase()
        );
        if (tool) {
          map.set(node.id, t(tool.description));
          return;
        }
      }
      if (node.group === 'paper') {
        // Try to match by paper id (remove "paper-" prefix and search)
        const paperId = node.id.replace(/^paper-/, '');
        const paper = papers.find(
          (p) => p.id === paperId || p.id.includes(paperId) || node.label.includes(p.title.en?.slice(0, 20) || '')
        );
        if (paper) {
          map.set(node.id, t(paper.title));
          return;
        }
        // Try matching by journal name in label
        const paperByTitle = papers.find((p) =>
          node.label.toLowerCase().includes(p.journal.toLowerCase().replace(/\s/g, '')) ||
          p.journal.toLowerCase().includes(node.label.toLowerCase())
        );
        if (paperByTitle) {
          map.set(node.id, t(paperByTitle.title));
          return;
        }
      }
      if (node.group === 'algo') {
        const algo = algorithms.find(
          (a) => a.name.toLowerCase() === node.label.toLowerCase()
        );
        if (algo) {
          map.set(node.id, t(algo.description));
          return;
        }
      }
      map.set(node.id, node.label);
    });

    return map;
  }, [network.nodes, tools, papers, algorithms, t]);

  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !network.nodes.length) return;

    const descMap = buildDescriptionMap();
    const width = svgRef.current.clientWidth || 700;
    const height = 420;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Zoom behavior
    const g = svg.append('g');
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .extent([[0, 0], [width, height]])
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        })
    );

    const nodesData = network.nodes.map((d) => ({ ...d }));
    const linksData = network.links.map((d) => ({ ...d }));

    const simulation = d3.forceSimulation(nodesData as any)
      .force('link', d3.forceLink(linksData)
        .id((d: any) => d.id)
        .distance(80)
        .strength(0.3)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(20));

    simulationRef.current = simulation;

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(linksData)
      .join('line')
      .attr('stroke', 'var(--border)')
      .attr('stroke-width', (d) => Math.max(0.5, d.value * 0.8))
      .attr('stroke-opacity', 0.5);

    // Nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodesData)
      .join('circle')
      .attr('r', (d) => Math.max(5, d.val * 0.7))
      .attr('fill', (d) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event: any, d: any) {
        d3.select(this).attr('stroke-width', 3).attr('stroke', 'var(--fg)');
        const desc = descMap.get(d.id) || d.label;
        setTooltip({
          x: event.offsetX || event.clientX,
          y: event.offsetY || event.clientY - 10,
          content: { name: d.label, summary: desc },
        });
      })
      .on('mouseleave', function () {
        d3.select(this).attr('stroke-width', 1.5).attr('stroke', '#fff');
        setTooltip(null);
      })
      .call(
        d3.drag<SVGCircleElement, any>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as any
      );

    // Labels
    const label = g.append('g')
      .selectAll('text')
      .data(nodesData)
      .join('text')
      .attr('dx', (d) => Math.max(5, d.val * 0.7) + 4)
      .attr('dy', 4)
      .attr('font-size', '10px')
      .attr('fill', 'var(--muted)')
      .text((d) => d.label);

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [network, buildDescriptionMap]);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full rounded-lg border" style={{ borderColor: 'var(--border)', minHeight: '420px' }} />
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg shadow-lg text-xs max-w-xs pointer-events-none"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--fg)',
          }}
        >
          <div className="font-semibold mb-1">{tooltip.content.name}</div>
          <div style={{ color: 'var(--muted)' }}>{tooltip.content.summary}</div>
        </div>
      )}
      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs" style={{ color: 'var(--muted)' }}>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B5CF6' }}></span> Tool
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></span> Paper
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></span> Algorithm
        </span>
      </div>
    </div>
  );
}
