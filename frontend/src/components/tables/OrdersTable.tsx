'use client';
import React, { useState, useEffect } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@/icons';
import Badge from '../ui/badge/Badge';
import Pagination from '../common/Pagination';

type OrderData = {
  order_id: string;
  customer_unique_id: string;
  order_status: string;
  order_purchase_timestamp: string;
  total_value: number;
};

type SortConfig = {
  key: keyof OrderData;
  direction: 'ascending' | 'descending';
} | null;

const PAGE_SIZE = 15;

const OrdersTable: React.FC = () => {
  const [data, setData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'order_purchase_timestamp', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const sortKey = sortConfig?.key || 'order_purchase_timestamp';
      const sortOrder = sortConfig?.direction === 'ascending' ? 'ASC' : 'DESC';
      
      try {
        const response = await fetch(`/api/v2/orders?sort_by=${sortKey}&order=${sortOrder}&page=${currentPage}&limit=${PAGE_SIZE}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result: { data: OrderData[], totalCount: number } = await response.json();
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'primary';
      case 'canceled': return 'error';
      case 'unavailable': return 'error';
      case 'processing': return 'warning';
      default: return 'secondary';
    }
  }

  const requestSort = (key: keyof OrderData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort
  };

  const getSortIcon = (key: keyof OrderData) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ArrowUpIcon className="w-4 h-4 ml-2" /> : <ArrowDownIcon className="w-4 h-4 ml-2" />;
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
                <th onClick={() => requestSort('order_id')} className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11 cursor-pointer">
                  <div className="flex items-center">Order ID {getSortIcon('order_id')}</div>
                </th>
                <th onClick={() => requestSort('customer_unique_id')} className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white cursor-pointer">
                  <div className="flex items-center">Customer {getSortIcon('customer_unique_id')}</div>
                </th>
                <th onClick={() => requestSort('order_status')} className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white cursor-pointer">
                  <div className="flex items-center">Status {getSortIcon('order_status')}</div>
                </th>
                <th onClick={() => requestSort('order_purchase_timestamp')} className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white cursor-pointer">
                  <div className="flex items-center">Date {getSortIcon('order_purchase_timestamp')}</div>
                </th>
                <th onClick={() => requestSort('total_value')} className="py-4 px-4 font-medium text-black dark:text-white cursor-pointer">
                  <div className="flex items-center">Total {getSortIcon('total_value')}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((order) => (
                <tr key={order.order_id}>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <p className="text-sm font-mono text-black dark:text-white">{order.order_id}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-sm font-mono text-black dark:text-white">{order.customer_unique_id}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <Badge color={getStatusBadgeColor(order.order_status)}>{order.order_status}</Badge>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{new Date(order.order_purchase_timestamp).toLocaleDateString()}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{order.total_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
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

export default OrdersTable;
