'use client';

import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/lib/api';

interface ProductData {
  product_id: string;
  category: string;
  sales_count: number;
}

const SellerTopProductsTable = ({ sellerId }: { sellerId: string }) => {
  const [data, setData] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const apiUrl = `${getApiBaseUrl()}/api/v2/sellers/${sellerId}/top-products?limit=5`;
        const res = await fetch(apiUrl);
        const result = await res.json();
        setData(result || []);
      } catch (error) {
        console.error('Failed to fetch top products for seller:', error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sellerId]);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
            Top 5 Best-Selling Products
        </h4>
        <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
                <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                        <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">Product ID</th>
                        <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Category</th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Sales Count</th>
                    </tr>
                </thead>
                <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan={3} className="py-5 text-center">Loading...</td>
                    </tr>
                ) : data.length > 0 ? (
                    data.map((product) => (
                        <tr key={product.product_id}>
                            <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                <p className="font-mono text-sm text-black dark:text-white">{product.product_id.substring(0,20)}...</p>
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <p className="text-black dark:text-white">{product.category}</p>
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <p className="text-black dark:text-white">{product.sales_count}</p>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={3} className="py-5 text-center">No products found for this seller.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default SellerTopProductsTable;
