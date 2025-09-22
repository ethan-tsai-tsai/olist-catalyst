'use client';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import TopProductsTable from '@/components/tables/TopProductsTable';

const TopProductsPage = () => {
  return (
    <>
      <Breadcrumb pageName="Top 5 Best-Selling Products" />
      <div className="flex flex-col gap-10">
        <TopProductsTable />
      </div>
    </>
  );
};

export default TopProductsPage;
