'use client';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SentimentDonutChartProps {
  series: number[];
  labels: string[];
}

const SentimentDonutChart: FC<SentimentDonutChartProps> = ({ series, labels }) => {
  const options: ApexOptions = {
    chart: {
      type: 'donut',
    },
    colors: ['#22c55e', '#ef4444', '#f97316'], // Positive, Negative, Neutral
    labels: labels,
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      show: true,
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg h-full">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Sentiment Distribution</h3>
        <div className="mx-auto flex justify-center">
            <ReactApexChart options={options} series={series} type="donut" height={350} />
        </div>
    </div>
  );
};

export default SentimentDonutChart;
