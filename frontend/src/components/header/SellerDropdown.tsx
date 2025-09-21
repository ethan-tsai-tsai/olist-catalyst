'use client';

import React from 'react';
import { useSeller } from '@/context/SellerContext';

const SellerDropdown: React.FC = () => {
  const { sellers, selectedSeller, setSelectedSeller } = useSeller();

  const handleSellerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeller(event.target.value);
  };

  return (
    <div className="relative">
      <select
        value={selectedSeller || ''}
        onChange={handleSellerChange}
        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-4 pr-10 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      >
        {sellers.map((seller) => (
          <option key={seller} value={seller}>
            {seller}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SellerDropdown;
