'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@/icons';
import Pagination from '../common/Pagination';

// Define a generic type for our table data
type SellerData = {
  seller_id: string;
  seller_city: string;
  seller_state: string;
  total_revenue: number;
  order_count: number;
};

type SortConfig = {
  key: keyof SellerData;
  direction: 'ascending' | 'descending';
} | null;

const PAGE_SIZE = 15;

const SellersTable: React.FC = () => {
  const [data, setData] = useState<SellerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'total_revenue', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const sortKey = sortConfig?.key || 'total_revenue';
      const sortOrder = sortConfig?.direction === 'ascending' ? 'ASC' : 'DESC';
      
      try {
        const response = await fetch(`/api/v2/sellers?sort_by=${sortKey}&order=${sortOrder}&page=${currentPage}&limit=${PAGE_SIZE}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result: { data: SellerData[], totalCount: number } = await response.json();
        setData(result.data);
        setTotalCount(result.totalCount);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sortConfig, currentPage]);

  const requestSort = (key: keyof SellerData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort
  };

  const getSortIcon = (key: keyof SellerData) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUpIcon className="w-4 h-4 ml-2" />;
    }
    return <ArrowDownIcon className="w-4 h-4 ml-2" />;
  };

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      {loading ? (
        <div className="py-6 text-center">Loading...</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th onClick={() => requestSort('seller_id')} className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11 cursor-pointer">
                  <div className="flex items-center">Seller ID {getSortIcon('seller_id')}</div>
                </th>
                <th onClick={() => requestSort('seller_city')} className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white cursor-pointer">
                  <div className="flex items-center">Location {getSortIcon('seller_city')}</div>
                </th>
                <th onClick={() => requestSort('total_revenue')} className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white cursor-pointer">
                  <div className="flex items-center">Revenue {getSortIcon('total_revenue')}</div>
                </th>
                <th onClick={() => requestSort('order_count')} className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white cursor-pointer">
                  <div className="flex items-center">Orders {getSortIcon('order_count')}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((seller) => (
                <tr key={seller.seller_id}>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <p className="text-sm font-mono text-black dark:text-white">{seller.seller_id}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{seller.seller_city}, {seller.seller_state}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{seller.total_revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{seller.order_count}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination 
        currentPage={currentPage} 
        totalCount={totalCount} 
        pageSize={PAGE_SIZE} 
        onPageChange={page => setCurrentPage(page)} 
      />
    </div>
  );
};

export default SellersTable;
