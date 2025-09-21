
'use client';

import Breadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";

const OrdersPage = () => {
  return (
    <>
      <Breadcrumb pageName="Orders" />

      <div className="flex flex-col gap-10">
        <BasicTableOne />
      </div>
    </>
  );
};

export default OrdersPage;
