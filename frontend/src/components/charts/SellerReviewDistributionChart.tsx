'use client';

import { useEffect, useState } from 'react';
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

interface ReviewData {
  review_score: number;
  count: number;
}

const SellerReviewDistributionChart = ({ sellerId }: { sellerId: string }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v2/sellers/${sellerId}/review-distribution`);
        const data: ReviewData[] = await res.json();

        if (data && data.length > 0) {
          const chartLabels = data.map(d => `${d.review_score} Star`);
          const chartValues = data.map(d => d.count);

          setChartData({
            labels: chartLabels,
            datasets: [
              {
                label: 'Number of Reviews',
                data: chartValues,
                backgroundColor: [
                    '#FF6384', // 1 Star
                    '#FF9F40', // 2 Stars
                    '#FFCD56', // 3 Stars
                    '#4BC0C0', // 4 Stars
                    '#36A2EB', // 5 Stars
                ],
              },
            ],
          });
        } else {
            setChartData(null);
        }
      } catch (error) {
        console.error('Failed to fetch review distribution:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sellerId]);

  const options = {
    indexAxis: 'y' as const, // Make it a horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for a cleaner look
      },
      title: {
        display: true,
        text: 'Customer Review Score Distribution',
      },
    },
    scales: {
        x: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Count of Reviews'
            }
        }
    }
  };

  if (isLoading) {
    return <div>Loading chart...</div>;
  }

  if (!chartData) {
    return <div>No review data available for this seller.</div>;
  }

  return <div style={{ height: '400px' }}><Bar data={chartData} options={options} /></div>;
};

export default SellerReviewDistributionChart;
