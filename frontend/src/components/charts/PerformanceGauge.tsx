'use client';
import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface RatingData {
    series: number[];
}

const PerformanceGauge: React.FC = () => {
  const [chartSeries, setChartSeries] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/platform-averages/average_rating');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: RatingData = await response.json();
        
        // Mock seller rating for now
        const mockSellerRating = 4.5;

        setChartSeries([mockSellerRating, data.series[0]]);

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
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: '60%'
        },
        dataLabels: {
          name: {
            fontSize: '22px',
          },
          value: {
            fontSize: '16px',
            formatter: function (val) {
                return val.toFixed(2)
            }
          },
          total: {
            show: true,
            label: 'Platform Avg',
            formatter: function (w) {
              // The second series is the platform average
              return w.globals.series[1] ? w.globals.series[1].toFixed(2) : 'N/A'
            }
          }
        }
      }
    },
    labels: ['Seller Rating', 'Platform Avg'],
    title: {
        text: 'Average Rating Comparison',
        align: 'center'
    },
    colors: ['#3C50E0', '#80CAEE']
  };

  if (loading) return <div>Loading Chart...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div id="performance-gauge-chart">
      <ReactApexChart options={options} series={chartSeries} type="radialBar" height={350} />
    </div>
  );
};

export default PerformanceGauge;
