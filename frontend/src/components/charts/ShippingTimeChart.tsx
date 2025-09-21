'use client';
import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface BoxPlotData {
    series: { type: string; data: { x: string; y: number[] }[] }[];
}

const ShippingTimeChart: React.FC = () => {
  const [chartData, setChartData] = useState<BoxPlotData['series'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, the seller ID would be dynamic
        const sellerApiUrl = 'http://localhost:8000/api/sellers/mock-id/shipping_time_stats';
        const platformApiUrl = 'http://localhost:8000/api/platform-averages/shipping_stats';

        const [sellerResponse, platformResponse] = await Promise.all([
            fetch(sellerApiUrl),
            fetch(platformApiUrl)
        ]);

        if (!sellerResponse.ok || !platformResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const sellerData: BoxPlotData = await sellerResponse.json();
        const platformData: BoxPlotData = await platformResponse.json();
        
        // The backend mock for seller currently returns sales_trend, so we will mock the data here
        const mockSellerBoxPlot = {
            type: 'boxPlot',
            data: [{
                x: 'Seller Performance',
                y: [1, 3, 4, 6, 9] // Mocked seller data
            }]
        };

        setChartData([mockSellerBoxPlot, platformData.series[0]]);

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
      type: 'boxPlot',
      height: 350,
      toolbar: {
        show: false,
      }
    },
    title: {
      text: 'Shipping Time in Days',
      align: 'left'
    },
    plotOptions: {
      boxPlot: {
        colors: {
          upper: '#3C50E0',
          lower: '#80CAEE'
        }
      }
    },
    xaxis: {
        title: {
            text: 'Comparison'
        }
    },
    yaxis: {
        title: {
            text: 'Days'
        }
    }
  };

  if (loading) return <div>Loading Chart...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div id="shipping-time-chart">
      <ReactApexChart options={options} series={chartData || []} type="boxPlot" height={350} />
    </div>
  );
};

export default ShippingTimeChart;
