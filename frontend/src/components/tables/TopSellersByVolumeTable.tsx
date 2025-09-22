'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface SellerVolume {
  seller_id: string;
  order_count: number;
  seller_city: string;
  seller_state: string;
}

export default function TopSellersByVolumeTable() {
  const [data, setData] = useState<SellerVolume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/v2/sellers?sort_by=order_count&order=DESC&limit=10');
        const result = await res.json();
        if (result && result.data) {
          setData(result.data); // Correctly access the data array
        } else {
          setData([]);
          console.error("API response is missing 'data' property", result);
        }
      } catch (error) {
        console.error('Failed to fetch top sellers by volume:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <h4 className="px-5 pt-5 text-xl font-semibold text-black dark:text-white">
        Top 10 Sellers by Orders
      </h4>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Seller ID</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Total Orders</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Location</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-5 text-center">Loading...</TableCell>
                </TableRow>
              ) : (
                data.map((seller) => (
                  <TableRow key={seller.seller_id}>
                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Link href={`/seller/${seller.seller_id}`} className="text-blue-500 hover:underline">
                        {seller.seller_id.substring(0, 15)}...
                      </Link>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {seller.order_count}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {`${seller.seller_city}, ${seller.seller_state}`}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
