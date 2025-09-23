'use client';

import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  ChartData,
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { getApiBaseUrl } from '@/lib/api';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface CategoryData {
  category: string;
  count: number;
}

const generateColorPalette = (numColors: number) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        const hue = (i * 360) / numColors;
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
};

const SellerCategoryDistributionChart = ({ sellerId }: { sellerId: string }) => {
  const [chartData, setChartData] = useState<ChartData<"doughnut"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const apiUrl = `${getApiBaseUrl()}/api/v2/sellers/${sellerId}/category-distribution`;
        const res = await fetch(apiUrl);
        const data: CategoryData[] = await res.json();

        if (data && data.length > 0) {
          const topN = 7; // Show top 7 categories and group the rest
          const otherCategories = data.slice(topN).reduce((acc, cur) => acc + cur.count, 0);
          const chartLabels = data.slice(0, topN).map(d => d.category);
          const chartValues = data.slice(0, topN).map(d => d.count);

          if (otherCategories > 0) {
              chartLabels.push('Other');
              chartValues.push(otherCategories);
          }

          setChartData({
            labels: chartLabels,
            datasets: [
              {
                label: 'Products Sold',
                data: chartValues,
                backgroundColor: generateColorPalette(chartLabels.length),
                hoverOffset: 4,
              },
            ],
          });
        } else {
            setChartData(null);
        }
      } catch (error) {
        console.error('Failed to fetch category distribution:', error);
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
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Product Category Distribution',
      },
    },
  };

  if (isLoading) {
    return <div>Loading chart...</div>;
  }

  if (!chartData) {
    return <div>No category data available for this seller.</div>;
  }

  return <div style={{ height: '400px' }}><Doughnut data={chartData} options={options} /></div>;
};

export default SellerCategoryDistributionChart;
