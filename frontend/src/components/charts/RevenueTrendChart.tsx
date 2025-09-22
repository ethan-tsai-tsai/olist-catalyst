'use client';
import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ChartData {
  series: { name: string; type: 'bar' | 'line'; data: number[] }[];
  categories: string[];
}

const RevenueTrendChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/platform/revenue-trend');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // --- Trend Line Calculation ---
        const revenueData = data.series[0].data;
        const n = revenueData.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (let i = 0; i < n; i++) {
          sumX += i;
          sumY += revenueData[i];
          sumXY += i * revenueData[i];
          sumX2 += i * i;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const trendLineData = revenueData.map((_, i) => parseFloat((slope * i + intercept).toFixed(2)));
        // --- End Calculation ---

        setChartData({
          categories: data.categories,
          series: [
            { name: 'Revenue', type: 'bar', data: revenueData },
            { name: 'Trend', type: 'line', data: trendLineData },
          ],
        });

      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#3C50E0", "#FBBF24"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 335,
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        columnWidth: "60%",
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [0, 4], // No stroke for bars, 4px for line
      curve: "smooth",
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "category",
      categories: chartData?.categories || [],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
      min: 0,
    },
  };

  if (loading) return <div className="flex items-center justify-center h-80">Loading Chart...</div>;
  if (error) return <div className="flex items-center justify-center h-80">Error: {error}</div>;

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <div className="w-full">
              <p className="font-semibold text-primary">Revenue and Trend</p>
              <p className="text-sm font-medium">Monthly</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
            <ReactApexChart
                options={options}
                series={chartData?.series || []}
                type="line" // Let the series objects define the type
                height={350}
            />
        </div>
      </div>
    </div>
  );
};

export default RevenueTrendChart;
