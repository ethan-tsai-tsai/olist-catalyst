'use client';
import React, { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, DollarLineIcon, GroupIcon, UserCircleIcon } from "@/icons";

interface KpiData {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_sellers: number;
  revenue_growth: number;
  orders_growth: number;
  customers_growth: number;
  sellers_growth: number;
}

const formatToMillion = (value: number): string => {
  if (!value) return 'R$ 0';
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  // For values less than a million, show more detail
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function PlatformKPIs() {
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/platform/kpis');
        const result: KpiData = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch platform KPIs:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"></div>
                    <div className="mt-5">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
                        <div className="mt-2 h-8 w-32 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
                    </div>
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
      {/* Revenue Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</span>
            <h4 className="mt-2 font-bold text-gray-800 text-xl dark:text-white/90">
              {data?.total_revenue ? formatToMillion(data.total_revenue) : 'R$ 0'}
            </h4>
          </div>
          <Badge color={data && data.revenue_growth > 0 ? "success" : "error"}>
            {data && data.revenue_growth > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {data?.revenue_growth}%
          </Badge>
        </div>
      </div>

      {/* Orders Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Orders</span>
            <h4 className="mt-2 font-bold text-gray-800 text-xl dark:text-white/90">
              {data?.total_orders.toLocaleString()}
            </h4>
          </div>
          <Badge color={data && data.orders_growth > 0 ? "success" : "error"}>
            {data && data.orders_growth > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {data?.orders_growth}%
          </Badge>
        </div>
      </div>

      {/* Customers Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Customers</span>
            <h4 className="mt-2 font-bold text-gray-800 text-xl dark:text-white/90">
              {data?.total_customers.toLocaleString()}
            </h4>
          </div>
          <Badge color={data && data.customers_growth > 0 ? "success" : "error"}>
            {data && data.customers_growth > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {data?.customers_growth}%
          </Badge>
        </div>
      </div>

      {/* Sellers Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <UserCircleIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Sellers</span>
            <h4 className="mt-2 font-bold text-gray-800 text-xl dark:text-white/90">
              {data?.total_sellers.toLocaleString()}
            </h4>
          </div>
          <Badge color={data && data.sellers_growth > 0 ? "success" : "error"}>
            {data && data.sellers_growth > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {data?.sellers_growth}%
          </Badge>
        </div>
      </div>
    </div>
  );
}
