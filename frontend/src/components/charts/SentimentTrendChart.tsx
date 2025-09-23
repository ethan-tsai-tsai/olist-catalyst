'use client';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SentimentTrendChartProps {
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
}

const SentimentTrendChart: FC<SentimentTrendChartProps> = ({ series, categories }) => {
  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    colors: ['#22c55e', '#f97316', '#ef4444'], // Green for positive, Orange for neutral, Red for negative
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    title: {
      text: 'Sentiment Trend Over Time',
      align: 'left',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#111827',
      },
    },
    xaxis: {
      categories: categories,
      title: {
        text: 'Month',
      },
    },
    yaxis: {
      title: {
        text: 'Number of Reviews',
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} reviews`,
      },
    },
    grid: {
      borderColor: '#e7e7e7',
      row: {
        colors: ['#f3f3f3', 'transparent'], // Zebra stripes for better readability
        opacity: 0.5,
      },
    },
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
        <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default SentimentTrendChart;
