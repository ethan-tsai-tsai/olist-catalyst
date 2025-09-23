'use client';

import { useEffect, useState } from 'react';
import { TimeIcon as ClockIcon, ListIcon as ArrowPathIcon, DollarLineIcon as BanknotesIcon, UserIcon as UserMinusIcon } from '@/icons';
import { getApiBaseUrl } from '@/lib/api';

interface PredictiveData {
  recency: number;
  average_frequency: number;
  average_monetary_value: number;
  churn_rate: number;
}

const InsightCard = ({ title, value, icon: Icon, unit = '', tooltip = '' }) => (
    <div className="rounded-lg border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark" title={tooltip}>
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

const SellerPredictiveInsights = ({ sellerId }: { sellerId: string }) => {
  const [data, setData] = useState<PredictiveData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const apiUrl = `${getApiBaseUrl()}/api/v2/sellers/${sellerId}/predictive-insights`;
        const res = await fetch(apiUrl);
        if (!res.ok) {
            throw new Error('Failed to fetch predictive insights');
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
  }, [sellerId]);

  if (isLoading) {
    return <div className="text-center py-4">Loading predictive insights...</div>;
  }

  if (error || !data) {
    return <div className="text-center py-4 text-red-500">Could not load predictive insights.</div>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
            Advanced Analytics (Customer Averages)
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-7.5">
            <InsightCard 
                title="Avg. Customer Recency" 
                value={Math.round(data.recency).toLocaleString()} 
                icon={ClockIcon} 
                unit=" days ago" 
                tooltip="Average time since the last purchase across all customers of this seller."
            />
            <InsightCard 
                title="Avg. Customer Frequency" 
                value={data.average_frequency.toFixed(2)} 
                icon={ArrowPathIcon} 
                unit=" orders" 
                tooltip="Average number of orders per customer for this seller."
            />
            <InsightCard 
                title="Avg. Customer Monetary Value" 
                value={data.average_monetary_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                icon={BanknotesIcon} 
                tooltip="Average revenue generated per customer for this seller."
            />
            <InsightCard 
                title="Customer Churn Rate" 
                value={data.churn_rate.toFixed(2)} 
                icon={UserMinusIcon} 
                unit="%" 
                tooltip="Percentage of this seller\'s customers who have not made a purchase in the last 180 days."
            />
        </div>
    </div>
  );
};

export default SellerPredictiveInsights;
