'use client';
import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ChartData {
  series: { name: string; data: number[][] }[];
}

const RfmChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // NOTE: In a real app, the seller ID would be dynamic.
        const response = await fetch('http://localhost:8000/api/sellers/mock-seller-id/rfm_customer_segments');
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
      height: 350,
      type: 'scatter',
      zoom: {
        enabled: true,
        type: 'xy'
      },
      toolbar: {
        show: false,
      }
    },
    xaxis: {
      tickAmount: 10,
      title: {
        text: 'Recency (Days since last purchase)'
      },
      labels: {
        formatter: function (val) {
          return parseFloat(val).toFixed(0)
        }
      }
    },
    yaxis: {
      tickAmount: 7,
      title: {
        text: 'Frequency (Number of purchases)'
      }
    },
    title: {
        text: 'RFM Analysis (Recency vs. Frequency)',
        align: 'left'
    },
    legend: {
        position: 'top'
    },
    tooltip: {
        x: {
            formatter: function(val) {
                return val + " days ago"
            }
        },
        y: {
            formatter: function(val) {
                return val + " purchases"
            }
        }
    }
  };

  if (loading) return <div>Loading Chart...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div id="rfm-chart">
      <ReactApexChart options={options} series={chartData?.series || []} type="scatter" height={350} />
    </div>
  );
};

export default RfmChart;
