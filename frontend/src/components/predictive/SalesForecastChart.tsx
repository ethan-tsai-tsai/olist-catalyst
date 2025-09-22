'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesForecast {
    ds: string;
    yhat: number;
    yhat_lower: number;
    yhat_upper: number;
}

interface SalesForecastChartProps {
  forecasts: { [category: string]: SalesForecast[] };
}

const SalesForecastChart: React.FC<SalesForecastChartProps> = ({ forecasts }) => {
  // 1. Aggregate data from all categories
  const aggregatedData: { [date: string]: { yhat: number; yhat_lower: number; yhat_upper: number } } = {};

  Object.values(forecasts).flat().forEach(item => {
    const date = new Date(item.ds).toISOString().split('T')[0];
    if (!aggregatedData[date]) {
      aggregatedData[date] = { yhat: 0, yhat_lower: 0, yhat_upper: 0 };
    }
    aggregatedData[date].yhat += item.yhat;
    aggregatedData[date].yhat_lower += item.yhat_lower;
    aggregatedData[date].yhat_upper += item.yhat_upper;
  });

  const sortedDates = Object.keys(aggregatedData).sort();
  const labels = sortedDates.map(date => date);
  const yhatData = sortedDates.map(date => aggregatedData[date].yhat);
  const yhatLowerData = sortedDates.map(date => aggregatedData[date].yhat_lower);
  const yhatUpperData = sortedDates.map(date => aggregatedData[date].yhat_upper);

  // 2. Chart.js data and options
  const data = {
    labels,
    datasets: [
      {
        label: 'Confidence Interval',
        data: yhatUpperData,
        fill: 'origin',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'transparent',
        pointRadius: 0,
        tension: 0.1,
      },
      {
        label: 'Forecasted Sales (GMV)',
        data: yhatData,
        fill: false,
        borderColor: '#3C50E0',
        backgroundColor: '#3C50E0',
        pointRadius: 2,
        tension: 0.4,
      },
      {
        label: 'Confidence Interval (Lower)',
        data: yhatLowerData,
        fill: '-1',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'transparent',
        pointRadius: 0,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: '#8a99af',
            // Filter out the lower bound legend item
            filter: function(legendItem: any, chartData: any) {
                return legendItem.datasetIndex !== 2;
            }
        }
      },
      title: {
        display: true,
        text: 'Platform-wide Sales Forecast (Next 30 Days)',
        color: '#1C2434',
        font: { size: 18 }
      },
      tooltip: {
        callbacks: {
            label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                }
                return label;
            }
        }
      }
    },
    scales: {
        y: {
            ticks: {
                color: '#8a99af',
                callback: function(value: any, index: any, values: any) {
                    return 'R$' + (value / 1000) + 'k';
                }
            }
        },
        x: {
            ticks: {
                color: '#8a99af'
            }
        }
    }
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div style={{ height: '400px' }}>
            <Line data={data} options={options} />
        </div>
    </div>
  );
};

export default SalesForecastChart;
