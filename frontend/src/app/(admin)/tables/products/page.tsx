'use client';
import Breadcrumb from '@/components/common/PageBreadCrumb';
import ProductsTable from '@/components/tables/ProductsTable';

const ProductsPage = () => {
  return (
    <>
      <Breadcrumb pageName="Products" />
      <div className="flex flex-col gap-10">
        <ProductsTable />
      </div>
    </>
  );
};

export default ProductsPage;
