
'use client';

import Breadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";

const ProductsPage = () => {
  return (
    <>
      <Breadcrumb pageName="Products" />

      <div className="flex flex-col gap-10">
        <BasicTableOne />
      </div>
    </>
  );
};

export default ProductsPage;
