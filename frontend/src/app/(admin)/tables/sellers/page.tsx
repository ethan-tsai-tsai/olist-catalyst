'use client';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import SellersTable from '@/components/tables/SellersTable';

const SellersPage = () => {
  return (
    <>
      <Breadcrumb pageName="Sellers" />
      <div className="flex flex-col gap-10">
        <SellersTable />
      </div>
    </>
  );
};

export default SellersPage;
