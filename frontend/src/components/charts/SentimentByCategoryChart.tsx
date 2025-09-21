'use client';
import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ChartData {
  series: { name: string; data: number[] }[];
  options: {
      xaxis: {
          categories: string[];
      }
  }
}

const SentimentByCategoryChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/overview/sentiment_by_category');
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
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: chartData?.options.xaxis.categories || [],
      title: {
        text: 'Product Category'
      }
    },
    yaxis: {
      title: {
        text: 'Number of Reviews'
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: ['#3C50E0', '#E53E3E']
  };

  if (loading) return <div>Loading Chart...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div id="sentiment-by-category-chart">
      <ReactApexChart options={options} series={chartData?.series || []} type="bar" height={350} />
    </div>
  );
};

export default SentimentByCategoryChart;
