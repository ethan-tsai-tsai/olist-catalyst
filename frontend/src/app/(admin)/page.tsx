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

        {/* Row 2: Revenue Chart */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <RevenueTrendChart />
        </div>

        {/* Row 3: Pie Charts */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <PaymentMethodDistributionChart />
            <OrderStatusDistributionChart />
        </div>

        {/* Row 4: Map */}
        <SalesRegionMap />

      </div>
    </>
  );
};

export default DashboardOverviewPage;