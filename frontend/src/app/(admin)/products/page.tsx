
'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const columns = [
    "product_id",
    "product_category_name",
    "product_name_length",
    "product_description_length",
    "product_photos_qty",
  ];

  return (
    <>
      <Breadcrumb pageName="Products" />

      <div className="flex flex-col gap-10">
        {loading ? <div>Loading...</div> : <BasicTableOne data={products} columns={columns} />}
      </div>
    </>
  );
};

export default ProductsPage;
