'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/PageBreadCrumb';

const SellerReportPage = () => {
  const [sellerId, setSellerId] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sellerId.trim()) {
      router.push(`/seller-report/${sellerId.trim()}`);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Seller Report" />
      <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Generate Seller Report
        </h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2.5 block text-black dark:text-white">
              Seller ID
            </label>
            <input
              type="text"
              placeholder="Enter seller ID (e.g., 3442f8959a84dea7ee197c632cb2df15)"
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray"
          >
            Generate Report
          </button>
        </form>
      </div>
    </>
  );
};

export default SellerReportPage;
