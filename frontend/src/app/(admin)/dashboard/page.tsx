'use client';

import Breadcrumb from "@/components/common/PageBreadCrumb";
import dynamic from "next/dynamic";

const SalesTrendChart = dynamic(
  () => import("@/components/charts/SalesTrendChart"),
  { ssr: false },
);

const ProductPotentialMatrix = dynamic(
  () => import("@/components/charts/ProductPotentialMatrix"),
  { ssr: false },
);

const CustomerJourneySankey = dynamic(
  () => import("@/components/charts/CustomerJourneySankey"),
  { ssr: false },
);

const SentimentByCategoryChart = dynamic(
  () => import("@/components/charts/SentimentByCategoryChart"),
  { ssr: false },
);

const CustomerGeoMap = dynamic(() => import("@/components/maps/CustomerGeoMap"), {
  ssr: false,
});

const DashboardOverviewPage = () => {
  return (
    <>
      <Breadcrumb pageName="Dashboard Overview" />

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        {/* <!-- Product Potential Matrix --> */}
        <div className="col-span-12 xl:col-span-8">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Product Potential Matrix
            </h4>
            <ProductPotentialMatrix />
          </div>
        </div>

        {/* <!-- Customer Journey Sankey --> */}
        <div className="col-span-12 xl:col-span-4">
          <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Customer Journey
            </h4>
            <CustomerJourneySankey />
          </div>
        </div>

        {/* <!-- Sentiment by Category --> */}
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Sentiment by Category
            </h4>
            <SentimentByCategoryChart />
          </div>
        </div>

        {/* <!-- Overall Sales Trend --> */}
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Overall Sales Trend
            </h4>
            <SalesTrendChart />
          </div>
        </div>

        {/* <!-- Customer Geo & AOV Heatmap --> */}
        <div className="col-span-12 xl:col-span-4">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Customer Geo Distribution
            </h4>
            <CustomerGeoMap />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardOverviewPage;
