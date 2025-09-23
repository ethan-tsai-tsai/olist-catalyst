'use client';

import { FC, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import RecentReviewsTable from '@/components/tables/RecentReviewsTable';
import Pagination from '@/components/tables/Pagination';

// Dynamically import the chart component with SSR turned off
const SentimentDistributionPieChart = dynamic(() => import('@/components/charts/SentimentDistributionPieChart'), {
  ssr: false,
});

const PAGE_SIZE = 10;

// Updated types to match the new API response
interface Review {
  review_id: string;
  review_score: number;
  review_comment_message: string;
  sentiment_label: 'positive' | 'neutral' | 'negative' | 'no_comment' | 'error';
  sentiment_score: number | null;
  seller_id: string;
  review_creation_date: string;
}

interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
  [key: string]: number;
}

interface SentimentData {
  distribution: SentimentDistribution;
  reviews: {
    data: Review[];
    totalCount: number;
  };
}

const SentimentDashboard: FC = () => {
  const [data, setData] = useState<SentimentData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (page: number) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/sentiment-analysis?page=${page}&limit=${PAGE_SIZE}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: SentimentData = await response.json();
        setData(result);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData(currentPage);
  }, [currentPage]); // Re-run effect when currentPage changes

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Loading Sentiment Analysis...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex justify-center items-center h-64 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
        </div>
    );
  }

  if (!data) {
    return <p>No data available.</p>;
  }

  const totalPages = Math.ceil(data.reviews.totalCount / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-10">
        <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
            <SentimentDistributionPieChart distribution={data.distribution} />
        </div>
        <div>
          <RecentReviewsTable reviews={data.reviews.data} title="Recent Customer Reviews" />
          <div className="mt-4 flex justify-center">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
    </div>
  );
};

export default SentimentDashboard;
