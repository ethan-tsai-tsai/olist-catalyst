'use client';

import Breadcrumb from "@/components/common/PageBreadCrumb";
import dynamic from "next/dynamic";

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

const AdvancedAnalyticsPage = () => {
  return (
    <>
      <Breadcrumb pageName="Advanced Analytics" />

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Product Potential Matrix
            </h4>
            <ProductPotentialMatrix />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Customer Journey
            </h4>
            <CustomerJourneySankey />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Sentiment by Category
            </h4>
            <SentimentByCategoryChart />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvancedAnalyticsPage;
