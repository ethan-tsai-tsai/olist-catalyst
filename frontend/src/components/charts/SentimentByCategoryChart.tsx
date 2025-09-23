'use client';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SentimentByCategoryChartProps {
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
}

const SentimentByCategoryChart: FC<SentimentByCategoryChartProps> = ({ series, categories }) => {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 450,
      stacked: true,
      toolbar: {
        show: true,
      },
    },
    colors: ['#22c55e', '#f97316', '#ef4444'],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
      },
    },
    stroke: {
      width: 1,
      colors: ['#fff'],
    },
    title: {
      text: 'Sentiment by Product Category',
      align: 'left',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#111827',
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        formatter: function (val) {
          return val + " reviews";
        },
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " reviews";
        },
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 40,
    },
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
      <ReactApexChart options={options} series={series} type="bar" height={450} />
    </div>
  );
};

export default SentimentByCategoryChart;