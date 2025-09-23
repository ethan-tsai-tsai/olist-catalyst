'use client';

import { useEffect, useState } from 'react';

interface OrderData {
  order_id: string;
  order_status: string;
  order_purchase_timestamp: string;
  total_value: number;
}

const StatusBadge = ({ status }: { status: string }) => {
    const statusClasses = {
        delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        canceled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        unavailable: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        invoiced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    const badgeStyle = statusClasses[status] || statusClasses.default;

    return (
        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${badgeStyle}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const SellerRecentOrdersTable = ({ sellerId }: { sellerId: string }) => {
  const [data, setData] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v2/sellers/${sellerId}/recent-orders?limit=5`);
        const result = await res.json();
        setData(result || []);
      } catch (error) {
        console.error('Failed to fetch recent orders for seller:', error);
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
            Recent Orders
        </h4>
        <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
                <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                        <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">Order ID</th>
                        <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Date</th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Status</th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Total Value</th>
                    </tr>
                </thead>
                <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan={4} className="py-5 text-center">Loading...</td>
                    </tr>
                ) : data.length > 0 ? (
                    data.map((order) => (
                        <tr key={order.order_id}>
                            <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                <p className="font-mono text-sm text-black dark:text-white">{order.order_id.substring(0,20)}...</p>
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <p className="text-black dark:text-white">{new Date(order.order_purchase_timestamp).toLocaleDateString()}</p>
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <StatusBadge status={order.order_status} />
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                <p className="text-black dark:text-white">{order.total_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={4} className="py-5 text-center">No recent orders found for this seller.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default SellerRecentOrdersTable;
