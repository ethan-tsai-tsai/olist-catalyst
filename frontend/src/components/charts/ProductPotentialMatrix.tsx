'use client';
import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ChartData {
  series: { name: string; data: number[][] }[];
}

const ProductPotentialMatrix: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/overview/product_potential_matrix');
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
      type: 'bubble',
      toolbar: {
        show: false,
      }
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 0.8
    },
    title: {
      text: 'Product Analysis: Rating vs. Sales Volume (Size by Profit %)',
      align: 'left',
      style: {
        fontSize: '16px',
        color: '#666'
      }
    },
    xaxis: {
      tickAmount: 10,
      type: 'numeric',
      title: {
        text: 'Average Customer Rating'
      },
    },
    yaxis: {
      title: {
        text: 'Sales Volume'
      },
      max: 10000
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return val + " units"
            }
        },
        z: {
            formatter: function (val) {
                return val + " %"
            }
        }
    },
    legend: {
        position: 'top'
    }
  };

  if (loading) return <div>Loading Chart...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div id="product-potential-matrix-chart">
      <ReactApexChart options={options} series={chartData?.series || []} type="bubble" height={350} />
    </div>
  );
};

export default ProductPotentialMatrix;
