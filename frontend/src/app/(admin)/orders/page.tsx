
'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const columns = [
    "order_id",
    "customer_unique_id",
    "order_status",
    "order_purchase_timestamp",
  ];

  return (
    <>
      <Breadcrumb pageName="Orders" />

      <div className="flex flex-col gap-10">
        {loading ? <div>Loading...</div> : <BasicTableOne data={orders} columns={columns} />}
      </div>
    </>
  );
};

export default OrdersPage;
