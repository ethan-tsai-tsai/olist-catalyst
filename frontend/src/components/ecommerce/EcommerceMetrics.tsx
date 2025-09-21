"use client";
import React, { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

interface MetricsData {
  customers: { total: number; growth: number };
  orders: { total: number; growth: number };
}

interface EcommerceMetricsProps {
  sellerId: string | null;
}

export default function EcommerceMetrics({ sellerId }: EcommerceMetricsProps) {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!sellerId) return;
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/sellers/${sellerId}/ecommerce-metrics`);
        const result: MetricsData = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch ecommerce metrics:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [sellerId]);

  if (loading) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data?.customers.total.toLocaleString()}
            </h4>
          </div>
          <Badge color={data && data.customers.growth > 0 ? "success" : "error"}>
            {data && data.customers.growth > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {data?.customers.growth}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data?.orders.total.toLocaleString()}
            </h4>
          </div>

          <Badge color={data && data.orders.growth > 0 ? "success" : "error"}>
            {data && data.orders.growth > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {data?.orders.growth}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
