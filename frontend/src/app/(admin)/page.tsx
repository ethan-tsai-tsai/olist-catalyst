'use client';

import Breadcrumb from "@/components/common/PageBreadCrumb";
import dynamic from "next/dynamic";

// Dynamically import all components
const PlatformKPIs = dynamic(
  () => import("@/components/ecommerce/PlatformKPIs"),
  { ssr: false },
);
const RevenueTrendChart = dynamic(
  () => import("@/components/charts/RevenueTrendChart"),
  { ssr: false },
);
const PaymentMethodDistributionChart = dynamic(
  () => import("@/components/charts/PaymentMethodDistributionChart"),
  { ssr: false },
);
const SalesRegionMap = dynamic(
  () => import("@/components/maps/SalesRegionMap"),
  { ssr: false },
);
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
const OrderStatusDistributionChart = dynamic(
  () => import("@/components/charts/OrderStatusDistributionChart"),
  { ssr: false },
);

const DashboardOverviewPage = () => {
  return (
    <>
      <Breadcrumb pageName="Platform BI Dashboard" />

      <div className="flex flex-col gap-4 md:gap-6">
        {/* Row 1: KPIs */}
        <PlatformKPIs />

        {/* Row 2: Revenue Chart and Payment Methods */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <RevenueTrendChart />
            <PaymentMethodDistributionChart />
        </div>

        {/* Row 3: Map */}
        <SalesRegionMap />

        {/* Row 4: Top Seller Tables */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 xl:col-span-6">
            <TopSellersByRevenueTable />
          </div>
          <div className="col-span-12 xl:col-span-6">
            <TopSellersByVolumeTable />
          </div>
        </div>

        {/* Row 5: Top Products and Order Status */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 xl:col-span-7">
                <TopProductsTable />
            </div>
            <OrderStatusDistributionChart />
        </div>

      </div>
    </>
  );
};

export default DashboardOverviewPage;