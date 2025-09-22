'use client';

import Breadcrumb from "@/components/common/PageBreadCrumb";
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

// Page component for displaying a single seller's dashboard
const SellerDashboardPage = ({ params }: { params: { sellerId: string } }) => {
  const { sellerId } = params;

  return (
    <>
      <Breadcrumb pageName={`Seller Dashboard: ${sellerId.substring(0, 15)}...`} />

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12">
          {/* Pass the sellerId from the URL to the metrics component */}
          <EcommerceMetrics sellerId={sellerId} />
        </div>

        <div className="col-span-12 xl:col-span-8">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Overall Sales Trend
            </h4>
            {/* Pass the sellerId to the sales chart */}
            <SalesTrendChart sellerId={sellerId} />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Customer Geo Distribution
            </h4>
            {/* Pass the sellerId to the geo map */}
            <CustomerGeoMap sellerId={sellerId} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerDashboardPage;
