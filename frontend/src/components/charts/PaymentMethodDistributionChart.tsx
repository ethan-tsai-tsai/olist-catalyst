'use client';
import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ChartData {
  series: number[];
  labels: string[];
}

const PaymentMethodDistributionChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData>({ series: [], labels: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/platform/payment-method-distribution');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: { [key: string]: number } = await response.json();
        
        const labels = Object.keys(data).map(s => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        const series = Object.values(data);

        setChartData({ series, labels });
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
      type: 'donut',
    },
    colors: ["#10B981", "#375E8A", "#FBBF24", "#F87171"],
    labels: chartData.labels,
    legend: {
      show: true,
      position: 'bottom',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          background: 'transparent',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  if (loading) return <div className="flex items-center justify-center h-60">Loading Chart...</div>;
  if (error) return <div className="flex items-center justify-center h-60">Error: {error}</div>;

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-4">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">Payment Methods</h5>
        </div>
      </div>
      <div className="mb-2">
        <div id="chartFour" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={chartData.series} type="donut" />
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodDistributionChart;
