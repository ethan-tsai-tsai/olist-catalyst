"use client";
import Breadcrumb from "@/components/common/PageBreadCrumb";
import dynamic from "next/dynamic";

const TopSellersByRevenueTable = dynamic(
  () => import("@/components/tables/TopSellersByRevenueTable"),
  { ssr: false },
);
const TopSellersByVolumeTable = dynamic(
  () => import("@/components/tables/TopSellersByVolumeTable"),
  { ssr: false },
);
const TopProductsTable = dynamic(
  () => import("@/components/tables/TopProductsTable"),
  { ssr: false },
);

const AnalyticsPage = () => {
  return (
    <>
      <Breadcrumb pageName="Sales Analytics" />

      <div className="flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 xl:col-span-6">
            <TopSellersByRevenueTable />
          </div>
          <div className="col-span-12 xl:col-span-6">
            <TopSellersByVolumeTable />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12">
            <TopProductsTable />
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsPage;
