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

interface SellerRevenue {
  seller_id: string;
  total_revenue: number;
  seller_city: string;
  seller_state: string;
}

export default function TopSellersByRevenueTable() {
  const [data, setData] = useState<SellerRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/platform/top-sellers-by-revenue');

        // --- Enhanced Debugging ---
        console.log("Response Headers:", Object.fromEntries(res.headers.entries()));
        const responseText = await res.text();
        console.log("Raw Response Text:", responseText);
        // --- End Enhanced Debugging ---

        // Now, try to parse the text we logged
        const sellers = JSON.parse(responseText);
        setData(sellers);

      } catch (error) {
        console.error('Failed to fetch or parse top sellers by revenue:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <h4 className="px-5 pt-5 text-xl font-semibold text-black dark:text-white">
        Top 10 Sellers by Revenue
      </h4>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Seller ID</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Total Revenue (R$)</TableCell>
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
                      {seller.total_revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
