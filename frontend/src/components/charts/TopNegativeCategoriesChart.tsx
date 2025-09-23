'use client';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TopNegativeCategoriesChartProps {
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
}

const TopNegativeCategoriesChart: FC<TopNegativeCategoriesChartProps> = ({ series, categories }) => {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: categories,
    },
    yaxis: {
      title: {
        text: 'Number of Negative Reviews'
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " reviews"
        }
      }
    },
    colors: ['#ef4444'] // Red for negative
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg h-full">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Top 5 Categories by Negative Reviews</h3>
        <ReactApexChart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default TopNegativeCategoriesChart;
