'use client';

import { FC, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import RecentReviewsTable from '@/components/tables/RecentReviewsTable';
import Pagination from '@/components/tables/Pagination';
import SimpleKpiCard from '@/components/common/SimpleKpiCard';
import { PieChartIcon } from '@/icons';

// --- Dynamically import chart components ---
const SentimentTrendChart = dynamic(() => import('@/components/charts/SentimentTrendChart'), { ssr: false });
const SentimentDonutChart = dynamic(() => import('@/components/charts/SentimentDonutChart'), { ssr: false });
const TopNegativeCategoriesChart = dynamic(() => import('@/components/charts/TopNegativeCategoriesChart'), { ssr: false });

const PAGE_SIZE = 10;

// --- TypeScript Interfaces for the new data structure ---
interface SentimentTrendData {
  months: string[];
  positive: number[];
  neutral: number[];
  negative: number[];
}

interface TopNegativeCategoriesData {
    categories: string[];
    counts: number[];
}

interface SentimentInsightsData {
  average_score: number;
  distribution: { [key: string]: number };
  top_negative_categories: TopNegativeCategoriesData;
  sentiment_trend: SentimentTrendData;
}

interface Review {
  review_id: string;
  review_score: number;
  review_comment_message: string;
  sentiment_label: 'positive' | 'neutral' | 'negative' | 'no_comment' | 'error';
  sentiment_score: number | null;
  seller_id: string;
  review_creation_date: string;
}

interface PaginatedReviews {
    data: Review[];
    totalCount: number;
}

const SentimentDashboard: FC = () => {
  const [insightsData, setInsightsData] = useState<SentimentInsightsData | null>(null);
  const [reviewsData, setReviewsData] = useState<PaginatedReviews | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const insightsResponse = await fetch('/api/sentiment-insights');
        if (!insightsResponse.ok) {
          throw new Error(`HTTP error! status: ${insightsResponse.status}`);
        }
        const insightsResult: SentimentInsightsData = await insightsResponse.json();
        setInsightsData(insightsResult);

        const reviewsResponse = await fetch(`/api/sentiment-analysis?page=1&limit=${PAGE_SIZE}`);
        if (!reviewsResponse.ok) {
            throw new Error(`HTTP error! status: ${reviewsResponse.status}`);
        }
        const reviewsResult = await reviewsResponse.json();
        setReviewsData(reviewsResult.reviews);

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (currentPage === 1) return; // Avoid re-fetching initial data

    const fetchReviewsPage = async (page: number) => {
        try {
            const reviewsResponse = await fetch(`/api/sentiment-analysis?page=${page}&limit=${PAGE_SIZE}`);
            if (!reviewsResponse.ok) {
                throw new Error(`HTTP error! status: ${reviewsResponse.status}`);
            }
            const reviewsResult = await reviewsResponse.json();
            setReviewsData(reviewsResult.reviews);
        } catch (e: any) {
            setError(e.message);
        }
    };

    fetchReviewsPage(currentPage);
  }, [currentPage]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-96">
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Loading Sentiment Insights...</p>
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

  if (!insightsData || !reviewsData) {
    return <div className="text-center p-10">No data available.</div>;
  }

  const totalPages = Math.ceil(reviewsData.totalCount / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <SimpleKpiCard 
                title="Overall Average Score"
                value={`${insightsData.average_score.toFixed(2)} / 5.0`}
                icon={<PieChartIcon className="w-6 h-6" />}
            />
            <div className="sm:col-span-2">
                <SentimentDonutChart 
                    labels={Object.keys(insightsData.distribution)}
                    series={Object.values(insightsData.distribution)}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <TopNegativeCategoriesChart 
                categories={insightsData.top_negative_categories.categories}
                series={[{ name: 'Negative Reviews', data: insightsData.top_negative_categories.counts }]}
            />
            {insightsData.sentiment_trend && insightsData.sentiment_trend.months.length > 0 && ( 
                <SentimentTrendChart 
                    categories={insightsData.sentiment_trend.months} 
                    series={[
                        { name: 'Positive', data: insightsData.sentiment_trend.positive },
                        { name: 'Neutral', data: insightsData.sentiment_trend.neutral },
                        { name: 'Negative', data: insightsData.sentiment_trend.negative },
                    ]}
                />
            )}
        </div>

        <div>
          {reviewsData.data && reviewsData.data.length > 0 ? (
            <>
              <RecentReviewsTable reviews={reviewsData.data} title="Recent Customer Reviews" />
              <div className="mt-4 flex justify-center">
                {totalPages > 1 && (
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="text-center p-10 bg-white dark:bg-boxdark rounded-lg shadow-lg">
              <p className="text-gray-500">No recent reviews to display.</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default SentimentDashboard;
