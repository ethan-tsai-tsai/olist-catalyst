'use client';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import OrdersTable from '@/components/tables/OrdersTable';

const OrdersPage = () => {
  return (
    <>
      <Breadcrumb pageName="Orders Log" />
      <div className="flex flex-col gap-10">
        <OrdersTable />
      </div>
    </>
  );
};

export default OrdersPage;
