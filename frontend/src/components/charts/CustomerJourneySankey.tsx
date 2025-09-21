'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

interface SankeyNode {
  name: string;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

const CustomerJourneySankey: React.FC = () => {
  const ref = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<SankeyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/overview/customer_journey_sankey');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const fetchedData: SankeyData = await response.json();
        setData(fetchedData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (ref.current && data) {
      // Clear previous render
      d3.select(ref.current).selectAll("*").remove();

      const width = 384;
      const height = 384;

      const svg = d3.select(ref.current)
        .attr('width', width)
        .attr('height', height)
        .append('g');

      const sankeyLayout = sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 1], [width - 1, height - 6]]);

      const graph = sankeyLayout(data as any);

      // Draw links
      svg.append('g')
        .attr('fill', 'none')
        .attr('stroke', '#000')
        .attr('stroke-opacity', 0.2)
        .selectAll('path')
        .data(graph.links)
        .enter()
        .append('path')
        .attr('d', sankeyLinkHorizontal())
        .attr('stroke-width', d => Math.max(1, (d as any).width));

      // Draw nodes
      svg.append('g')
        .attr('stroke', '#000')
        .selectAll('rect')
        .data(graph.nodes)
        .enter()
        .append('rect')
        .attr('x', d => (d as any).x0)
        .attr('y', d => (d as any).y0)
        .attr('height', d => (d as any).y1 - (d as any).y0)
        .attr('width', d => (d as any).x1 - (d as any).x0)
        .attr('fill', '#3C50E0');

      // Add labels
      svg.append('g')
        .style('font', '10px sans-serif')
        .selectAll('text')
        .data(graph.nodes)
        .enter()
        .append('text')
        .attr('x', d => (d as any).x0 < width / 2 ? (d as any).x1 + 6 : (d as any).x0 - 6)
        .attr('y', d => ((d as any).y1 + (d as any).y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', d => (d as any).x0 < width / 2 ? 'start' : 'end')
        .text(d => (d as any).name);
    }
  }, [data]);

  if (loading) return <div>Loading Chart...</div>;
  if (error) return <div>Error: {error}</div>;

  return <svg ref={ref} id="customer-journey-sankey-chart"></svg>;
};

export default CustomerJourneySankey;
