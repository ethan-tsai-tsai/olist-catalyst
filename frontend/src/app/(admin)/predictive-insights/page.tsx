'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components that are not SSR-friendly
const KpiCard = dynamic(() => import('@/components/common/KpiCard'), { ssr: false });
const SalesForecastChart = dynamic(() => import('@/components/predictive/SalesForecastChart'), { ssr: false });
const ChurnDriversChart = dynamic(() => import('@/components/predictive/ChurnDriversChart'), { ssr: false });
const SellerPerformanceTable = dynamic(() => import('@/components/predictive/SellerPerformanceTable'), { ssr: false });

// Icons can be imported directly
import IconUserCircle from '@/icons/user-circle.svg';
import IconDollarLine from '@/icons/dollar-line.svg';
import IconPieChart from '@/icons/pie-chart.svg';
import IconArrowUp from '@/icons/arrow-up.svg';

// --- TypeScript Interfaces ---
interface ChurnPrediction {
  customer_unique_id: string;
  Recency: number;
  Frequency: number;
  Monetary: number;
  Purchase_Diversity: number;
  is_churn: number;
  churn_probability: number;
}

interface FeatureImportance {
  Feature: string;
  Importance: number;
}

interface SalesForecast {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

interface SellerPerformanceData {
  seller_id: string;
  total_customers: number;
  high_risk_customers: number;
  seller_churn_rate: number;
  affected_gmv: number;
}

interface PredictiveInsightsData {
  churn_analysis: {
    predictions: ChurnPrediction[];
    feature_importance: FeatureImportance[];
  };
  sales_forecast: {
    [category: string]: SalesForecast[];
  };
  seller_performance: SellerPerformanceData[];
}

const PredictiveInsightsPage = () => {
  const [data, setData] = useState<PredictiveInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/platform/predictive-insights');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: PredictiveInsightsData = await response.json();
        setData(result);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-10">Loading...</div>;
    }
  
    if (error) {
      return <div className="text-center p-10 text-red-500">Error fetching data: {error}</div>;
    }
  
    if (!data) {
      return <div className="text-center p-10">No data available.</div>;
    }

    // --- Calculate KPI Metrics ---
    const churnPredictions = data.churn_analysis.predictions;
    // Define high-risk based on rules instead of flawed probability
    const highRiskCustomers = churnPredictions.filter(p => p.is_churn === 0 && p.Recency > 90 && p.Frequency <= 2);
    const totalActiveCustomers = churnPredictions.filter(p => p.is_churn === 0);
    const churnRate = totalActiveCustomers.length > 0 ? (highRiskCustomers.length / totalActiveCustomers.length) * 100 : 0;
    const affectedGmv = highRiskCustomers.reduce((sum, customer) => sum + customer.Monetary, 0);

    const allForecasts = Object.values(data.sales_forecast).flat();
    // To handle the historical dataset, we define "now" as a relevant point in time for the data.
    const now = new Date('2018-09-01');
    now.setHours(0, 0, 0, 0); // Set current time to the beginning of the day for a clean date comparison

    const futureForecasts = allForecasts.filter(f => {
      const forecastDate = new Date(f.ds);
      forecastDate.setHours(0, 0, 0, 0);
      return forecastDate > now;
    });
    const predictedTotalGmv = futureForecasts.reduce((sum, forecast) => sum + forecast.yhat, 0);

    return (
      <>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            <KpiCard title="High-Risk Customers" value={highRiskCustomers.length.toLocaleString()}>
              <IconUserCircle className="w-6 h-6" />
            </KpiCard>
            <KpiCard title="Platform-wide Churn Rate" value={`${churnRate.toFixed(2)}%`}>
               <IconPieChart className="w-6 h-6" />
            </KpiCard>
            <KpiCard title="Affected GMV from Churn" value={`R${affectedGmv.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
              <IconDollarLine className="w-6 h-6" />
            </KpiCard>
            <KpiCard title="Predicted Next Month GMV" value={`R${predictedTotalGmv.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
              <IconArrowUp className="w-6 h-6" />
            </KpiCard>
        </div>

        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5">
          <div className="col-span-12 xl:col-span-8">
              <SalesForecastChart forecasts={data.sales_forecast} />
          </div>
          <div className="col-span-12 xl:col-span-4">
              <ChurnDriversChart importanceData={data.churn_analysis.feature_importance} />
          </div>
        </div>

         <div className="mt-4 md:mt-6 2xl:mt-7.5">
            {data.seller_performance && <SellerPerformanceTable sellerData={data.seller_performance} />}
         </div>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Platform Operations Forecast</h1>
      {renderContent()}
    </div>
  );
};

export default PredictiveInsightsPage;
