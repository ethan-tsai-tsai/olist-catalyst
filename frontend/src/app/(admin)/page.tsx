'use client';

import Breadcrumb from "@/components/common/PageBreadCrumb";
import { useSeller } from "@/context/SellerContext";
import dynamic from "next/dynamic";

const SalesTrendChart = dynamic(
  () => import("@/components/charts/SalesTrendChart"),
  { ssr: false },
);

const CustomerGeoMap = dynamic(() => import("@/components/maps/CustomerGeoMap"), {
  ssr: false,
});

const EcommerceMetrics = dynamic(
  () => import("@/components/ecommerce/EcommerceMetrics"),
  { ssr: false },
);

const DashboardOverviewPage = () => {
  const { selectedSeller } = useSeller();

  return (
    <>
      <Breadcrumb pageName="Dashboard Overview" />

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12">
          <EcommerceMetrics sellerId={selectedSeller} />
        </div>

        <div className="col-span-12 xl:col-span-8">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Overall Sales Trend
            </h4>
            <SalesTrendChart sellerId={selectedSeller} />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Customer Geo Distribution
            </h4>
            <CustomerGeoMap sellerId={selectedSeller} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardOverviewPage;