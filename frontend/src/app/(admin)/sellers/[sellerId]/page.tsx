'use client';

import { useEffect, useState } from 'react';
import { Metadata } from "next";
import React from "react";
import { FolderIcon as MapPinIcon, CalenderIcon as CalendarDaysIcon, ShootingStarIcon as StarIcon, DollarLineIcon as CurrencyDollarIcon, BoxIcon as ShoppingCartIcon, BoxCubeIcon as CubeIcon, CheckCircleIcon } from '@/icons';
import SellerSalesTrendChart from '@/components/charts/SellerSalesTrendChart';
import SellerCategoryDistributionChart from '@/components/charts/SellerCategoryDistributionChart';
import SellerTopProductsTable from '@/components/tables/SellerTopProductsTable';
import SellerReviewDistributionChart from '@/components/charts/SellerReviewDistributionChart';
import SellerRecentOrdersTable from '@/components/tables/SellerRecentOrdersTable';
import SellerPredictiveInsights from '@/components/predictive/SellerPredictiveInsights';

// This metadata is for static generation and might not be used in client-rendered pages directly,
// but it's good practice to keep it.
// export const metadata: Metadata = {
//   title: "Seller Details | Olist Seller Success Dashboard",
//   description: "Detailed analytics and insights for a specific seller.",
// };

interface SellerDetailsData {
  seller_id: string;
  seller_city: string;
  seller_state: string;
  first_sale_date: string;
  total_revenue: number;
  total_orders: number;
  distinct_products_sold: number;
  average_review_score: number;
  on_time_delivery_rate: number;
}

const KpiCard = ({ title, value, icon: Icon, unit = '' }) => (
  <div className="rounded-lg border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
    <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
      <Icon className="h-6 w-6 text-primary dark:text-white" />
    </div>
    <div className="mt-4 flex items-end justify-between">
      <div>
        <h4 className="text-title-md font-bold text-black dark:text-white">
          {value}{unit}
        </h4>
        <span className="text-sm font-medium">{title}</span>
      </div>
    </div>
  </div>
);

const SellerDetailsPage = ({ params }: { params: { sellerId: string } }) => {
  const { sellerId } = params;
  const [data, setData] = useState<SellerDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v2/sellers/${sellerId}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Seller not found');
          } else {
            throw new Error('Failed to fetch seller data');
          }
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <h2 className="mb-6 text-2xl font-bold text-black dark:text-white">
          Loading Seller Details...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <h2 className="mb-6 text-2xl font-bold text-red-500 dark:text-red-400">
          Error: {error}
        </h2>
      </div>
    );
  }

  if (!data) {
    return null; // Or a 'no data' component
  }

  return (
    <>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-black dark:text-white">
                Seller Overview
            </h2>
            <div className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-boxdark-2 p-2 rounded">
                ID: {sellerId}
            </div>
        </div>

        {/* Overview & KPIs */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            <KpiCard title="Location" value={`${data.seller_city}, ${data.seller_state}`} icon={MapPinIcon} />
            <KpiCard title="Member Since" value={new Date(data.first_sale_date).toLocaleDateString()} icon={CalendarDaysIcon} />
            <KpiCard title="Avg. Rating" value={data.average_review_score.toFixed(2)} icon={StarIcon} />
            <KpiCard title="On-Time Delivery" value={data.on_time_delivery_rate.toFixed(2)} icon={CheckCircleIcon} unit="%" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5 mt-6">
            <KpiCard title="Total Revenue" value={data.total_revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={CurrencyDollarIcon} />
            <KpiCard title="Total Orders" value={data.total_orders.toLocaleString()} icon={ShoppingCartIcon} />
            <KpiCard title="Distinct Products Sold" value={data.distinct_products_sold.toLocaleString()} icon={CubeIcon} />
        </div>

        {/* Charts and detailed tables */}
        <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-8">
             <SellerSalesTrendChart sellerId={sellerId} />
          </div>
          <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
             <SellerCategoryDistributionChart sellerId={sellerId} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
            <div className="col-span-12 xl:col-span-6">
                <SellerTopProductsTable sellerId={sellerId} />
            </div>
            <div className="col-span-12 xl:col-span-6">
                <SellerRecentOrdersTable sellerId={sellerId} />
            </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
            <div className="col-span-12">
                <SellerPredictiveInsights sellerId={sellerId} />
            </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
            <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
                <SellerReviewDistributionChart sellerId={sellerId} />
            </div>
        </div>
      </div>
    </>
  );
};

export default SellerDetailsPage;
