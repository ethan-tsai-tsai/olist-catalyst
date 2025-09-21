'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SellerContextType {
  selectedSeller: string | null;
  setSelectedSeller: (sellerId: string) => void;
  sellers: string[];
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export const useSeller = () => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
};

export const SellerProvider = ({ children }: { children: ReactNode }) => {
  const [sellers, setSellers] = useState<string[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/sellers');
        const data = await response.json();
        setSellers(data);
        if (data.length > 0) {
          setSelectedSeller(data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch sellers:", error);
      }
    };

    fetchSellers();
  }, []);

  return (
    <SellerContext.Provider value={{ selectedSeller, setSelectedSeller, sellers }}>
      {children}
    </SellerContext.Provider>
  );
};
