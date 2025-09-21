'use client';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/common/PageBreadCrumb';

import RfmChart from '@/components/charts/RfmChart';

import ShippingTimeChart from '@/components/charts/ShippingTimeChart';

import AssociationRulesGraph from '@/components/charts/AssociationRulesGraph';

import PerformanceGauge from '@/components/charts/PerformanceGauge';

const SpecificSellerReportPage = () => {
  const params = useParams();
  const sellerId = params.seller_id as string;

  return (
    <>
      <Breadcrumb pageName={`Report for Seller: ${sellerId ? sellerId.slice(0, 8) + '...' : ''}`} />

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        {/* <!-- RFM Customer Value Quadrant --> */}
        <div className="col-span-12 xl:col-span-7">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              RFM Customer Value Quadrant
            </h4>
            <RfmChart />
          </div>
        </div>

        {/* <!-- Association Rules Product Network --> */}
        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Association Rules Product Network
            </h4>
            <AssociationRulesGraph />
          </div>
        </div>

        {/* <!-- Shipping Time Distribution Comparison --> */}
        <div className="col-span-12 md:col-span-6 xl:col-span-6">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Shipping Time Distribution (vs. Platform)
            </h4>
            <ShippingTimeChart />
          </div>
        </div>

        {/* <!-- Performance vs. Platform Average --> */}
        <div className="col-span-12 md:col-span-6 xl:col-span-6">
          <div className="rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Performance vs. Platform Average
            </h4>
            <PerformanceGauge />
          </div>
        </div>

      </div>
    </>
  );
};

export default SpecificSellerReportPage;
