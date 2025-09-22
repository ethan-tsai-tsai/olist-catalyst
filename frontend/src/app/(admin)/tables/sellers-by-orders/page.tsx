'use client';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import TopSellersByVolumeTable from '@/components/tables/TopSellersByVolumeTable';

const SellersByOrdersPage = () => {
  return (
    <>
      <Breadcrumb pageName="Top 10 Sellers by Orders" />
      <div className="flex flex-col gap-10">
        <TopSellersByVolumeTable />
      </div>
    </>
  );
};

export default SellersByOrdersPage;
