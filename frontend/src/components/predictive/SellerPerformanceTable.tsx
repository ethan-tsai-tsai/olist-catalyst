'use client';

import React, { useState, useMemo } from 'react';

interface SellerPerformanceData {
  seller_id: string;
  total_customers: number;
  high_risk_customers: number;
  seller_churn_rate: number;
  affected_gmv: number;
}

interface SellerPerformanceTableProps {
  sellerData: SellerPerformanceData[];
}

type SortKey = keyof SellerPerformanceData;

const SellerPerformanceTable: React.FC<SellerPerformanceTableProps> = ({ sellerData }) => {
  const [sortKey, setSortKey] = useState<SortKey>('seller_churn_rate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedData = useMemo(() => {
    const data = [...sellerData];
    data.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [sellerData, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortOrder === 'desc' ? ' ▼' : ' ▲';
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Seller Retention Performance
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-5 rounded-sm bg-gray-2 dark:bg-meta-4">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base cursor-pointer" onClick={() => handleSort('seller_id')}>
              Seller ID{getSortIndicator('seller_id')}
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base cursor-pointer" onClick={() => handleSort('total_customers')}>
              Total Customers{getSortIndicator('total_customers')}
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base cursor-pointer" onClick={() => handleSort('high_risk_customers')}>
              High-Risk Customers{getSortIndicator('high_risk_customers')}
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base cursor-pointer" onClick={() => handleSort('affected_gmv')}>
              Affected GMV{getSortIndicator('affected_gmv')}
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base cursor-pointer" onClick={() => handleSort('seller_churn_rate')}>
              Churn Rate (%){getSortIndicator('seller_churn_rate')}
            </h5>
          </div>
        </div>

        {sortedData.slice(0, 15).map((seller, key) => (
          <div
            className={`grid grid-cols-5 ${key === sortedData.slice(0, 15).length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}`}
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <p className="hidden text-black dark:text-white sm:block truncate" title={seller.seller_id}>{seller.seller_id.slice(0, 15)}...</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{seller.total_customers}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-meta-5">{seller.high_risk_customers}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">R${seller.affected_gmv.toFixed(2)}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className={`font-medium ${seller.seller_churn_rate > 20 ? 'text-meta-5' : 'text-meta-3'}`}>
                {seller.seller_churn_rate.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerPerformanceTable;
