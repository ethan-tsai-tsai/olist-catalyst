'use client';
import React, { useState, useEffect } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@/icons';
import Pagination from '../common/Pagination';

type ProductData = {
  product_id: string;
  category: string;
  sales_count: number;
};

type SortConfig = {
  key: keyof ProductData;
  direction: 'ascending' | 'descending';
} | null;

const PAGE_SIZE = 15;

const ProductsTable: React.FC = () => {
  const [data, setData] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'sales_count', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const sortKey = sortConfig?.key || 'sales_count';
      const sortOrder = sortConfig?.direction === 'ascending' ? 'ASC' : 'DESC';
      
      try {
        const response = await fetch(`/api/v2/products?sort_by=${sortKey}&order=${sortOrder}&page=${currentPage}&limit=${PAGE_SIZE}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result: { data: ProductData[], totalCount: number } = await response.json();
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

  const requestSort = (key: keyof ProductData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort
  };

  const getSortIcon = (key: keyof ProductData) => {
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
                <th onClick={() => requestSort('product_id')} className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11 cursor-pointer">
                  <div className="flex items-center">Product ID {getSortIcon('product_id')}</div>
                </th>
                <th onClick={() => requestSort('category')} className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white cursor-pointer">
                  <div className="flex items-center">Category {getSortIcon('category')}</div>
                </th>
                <th onClick={() => requestSort('sales_count')} className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white cursor-pointer">
                  <div className="flex items-center">Sales Count {getSortIcon('sales_count')}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((product) => (
                <tr key={product.product_id}>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <p className="text-sm font-mono text-black dark:text-white">{product.product_id}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{product.category}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{product.sales_count}</p>
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

export default ProductsTable;
