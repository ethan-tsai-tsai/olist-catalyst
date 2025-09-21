'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface GraphNode {
  id: string;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const AssociationRulesGraph: React.FC = () => {
  const ref = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/sellers/mock-id/association_rules_graph');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // The mock API returns Sankey data, we need to adapt it or use a mock
        const fetchedData: any = await response.json();
        const adaptedData: GraphData = {
            nodes: fetchedData.nodes.map((n: any) => ({ id: n.name })),
            links: fetchedData.links.map((l: any) => ({...l, source: fetchedData.nodes[l.source].name, target: fetchedData.nodes[l.target].name }))
        }
        setData(adaptedData);
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
      d3.select(ref.current).selectAll("*").remove();

      const width = 500;
      const height = 400;

      const svg = d3.select(ref.current)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [-width / 2, -height / 2, width, height]);

      const simulation = d3.forceSimulation(data.nodes as any)
        .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-150))
        .force("center", d3.forceCenter());

      const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(data.links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value) * 2);

      const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", 10)
        .attr("fill", '#3C50E0');

      const labels = svg.append("g")
        .selectAll("text")
        .data(data.nodes)
        .join("text")
        .text((d: any) => d.id)
        .attr('x', 12)
        .attr('y', 4)
        .style('font-size', '12px')
        .style('fill', '#333');

      simulation.on("tick", () => {
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

        node
          .attr("cx", (d: any) => d.x)
          .attr("cy", (d: any) => d.y);
        
        labels
          .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
      });
    }
  }, [data]);

  if (loading) return <div>Loading Chart...</div>;
  if (error) return <div>Error: {error}</div>;

  return <svg ref={ref} id="association-rules-graph"></svg>;
};

export default AssociationRulesGraph;
