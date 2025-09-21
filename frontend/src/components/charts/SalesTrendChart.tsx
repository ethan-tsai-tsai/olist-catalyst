'use client';
import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ChartData {
  series: { name: string; data: number[] }[];
  options: {
    xaxis: {
      categories: string[];
    };
  };
}

const SalesTrendChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/overview/sales_trend');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: ChartData = await response.json();
        setChartData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      }
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    title: {
      text: 'Monthly Sales Trend',
      align: 'left',
      style: {
        fontSize: '16px',
        color: '#666'
      }
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'],
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: chartData?.options.xaxis.categories || [],
      title: {
        text: 'Month'
      }
    },
    yaxis: {
      title: {
        text: 'Sales (in thousands)'
      },
    },
    colors: ['#3C50E0']
  };

  if (loading) return <div>Loading Chart...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div id="sales-trend-chart">
      <ReactApexChart options={options} series={chartData?.series || []} type="line" height={350} />
    </div>
  );
};

export default SalesTrendChart;
