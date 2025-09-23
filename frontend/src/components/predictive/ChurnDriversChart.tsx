// @ts-nocheck
'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FeatureImportance {
  Feature: string;
  Importance: number;
}

interface ChurnDriversChartProps {
  importanceData: FeatureImportance[];
}

const ChurnDriversChart: React.FC<ChurnDriversChartProps> = ({ importanceData }) => {
  // Sort data to show the most important feature on top
  const sortedData = [...importanceData].sort((a, b) => b.Importance - a.Importance);

  const data = {
    labels: sortedData.map(d => d.Feature),
    datasets: [
      {
        label: 'Importance',
        data: sortedData.map(d => d.Importance),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const, // This makes the bar chart horizontal
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for a cleaner look
      },
      title: {
        display: true,
        text: 'Customer Churn Drivers',
        color: '#1C2434',
        font: { size: 18 },
      },
      tooltip: {
        callbacks: {
            label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.x !== null) {
                    label += context.parsed.x.toFixed(3);
                }
                return label;
            }
        }
      }
    },
    scales: {
        x: {
            ticks: {
                color: '#8a99af',
            },
            title: {
                display: true,
                text: 'Importance Score',
                color: '#8a99af',
            }
        },
        y: {
            ticks: {
                color: '#8a99af'
            }
        }
    }
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div style={{ height: '400px' }}>
            <Bar data={data} options={options} />
        </div>
    </div>
  );
};

export default ChurnDriversChart;
