'use client';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import TopSellersByRevenueTable from '@/components/tables/TopSellersByRevenueTable';

const SellersByRevenuePage = () => {
  return (
    <>
      <Breadcrumb pageName="Top 10 Sellers by Revenue" />
      <div className="flex flex-col gap-10">
        <TopSellersByRevenueTable />
      </div>
    </>
  );
};

export default SellersByRevenuePage;
