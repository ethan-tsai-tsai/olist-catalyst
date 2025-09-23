'use client';

import { useEffect, useState } from 'react';
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

interface SalesTrendData {
  month: string;
  monthly_revenue: number;
}

const SellerSalesTrendChart = ({ sellerId }: { sellerId: string }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v2/sellers/${sellerId}/sales-trend`);
        const data: SalesTrendData[] = await res.json();

        if (data && data.length > 0) {
          const chartLabels = data.map(d => d.month);
          const chartValues = data.map(d => d.monthly_revenue);

          setChartData({
            labels: chartLabels,
            datasets: [
              {
                label: 'Monthly Revenue',
                data: chartValues,
                borderColor: '#3C50E0',
                backgroundColor: 'rgba(60, 80, 224, 0.1)',
                fill: true,
              },
            ],
          });
        } else {
            setChartData(null); // No data to display
        }
      } catch (error) {
        console.error('Failed to fetch sales trend:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sellerId]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Seller Monthly Sales Revenue',
      },
    },
    scales: {
        y: {
            beginAtZero: true
        }
    }
  };

  if (isLoading) {
    return <div>Loading chart...</div>;
  }

  if (!chartData) {
    return <div>No sales data available for this seller.</div>;
  }

  return <div style={{ height: '400px' }}><Line data={chartData} options={options} /></div>;
};

export default SellerSalesTrendChart;
