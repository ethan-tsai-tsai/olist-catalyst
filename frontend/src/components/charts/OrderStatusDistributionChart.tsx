'use client';
import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ChartData {
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
}

const OrderStatusDistributionChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData>({ series: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/platform/order-status-distribution');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: { [key: string]: number } = await response.json();

        // Filter out the 'delivered' status to focus on other statuses
        delete data.delivered;
        
        const sortedData = Object.entries(data).sort(([,a],[,b]) => b-a);

        const categories = sortedData.map(item => item[0]);
        const seriesData = sortedData.map(item => item[1]);

        setChartData({ series: [{ name: 'Count', data: seriesData }], categories: categories });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options: ApexOptions = {
    colors: ["#3C50E0"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: 'bar',
      height: 350,
      toolbar: {
        show: false,
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Order Count",
        style: {
          fontSize: "14px",
          fontWeight: 500,
        }
      }
    },
    grid: {
      strokeDashArray: 4,
    }
  };

  if (loading) return <div className="flex items-center justify-center h-60">Loading Chart...</div>;
  if (error) return <div className="flex items-center justify-center h-60">Error: {error}</div>;

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 lg:col-span-6 xl:col-span-4">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">Undelivered Order Status</h5>
        </div>
      </div>
      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={chartData.series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
};

export default OrderStatusDistributionChart;
