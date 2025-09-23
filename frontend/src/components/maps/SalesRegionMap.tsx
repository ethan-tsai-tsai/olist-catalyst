// @ts-nocheck
'use client';
import React, { useState, useEffect } from 'react';
import { VectorMap } from '@react-jvectormap/core';
import { brMill } from '@react-jvectormap/brazil';

interface MapData {
    values: { [key: string]: number };
}

const SalesRegionMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/platform/sales-by-region`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: { [key: string]: number } = await response.json();

        const formattedData: { [key: string]: number } = {};
        for (const key in data) {
          formattedData[key.toLowerCase()] = data[key];
        }

        setMapData({ values: formattedData });
      } catch (error) {
        console.error("Failed to load map data:", error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96">Loading Map...</div>;
  if (error) return <div className="flex items-center justify-center h-96">Error: {error}</div>;

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark lg:col-span-12">
        <h4 className="mb-2 text-xl font-semibold text-black dark:text-white">
            Sales by Region
        </h4>
        <div style={{ width: '100%', height: 384 }}>
        <VectorMap
            key={mapData ? 'data-loaded' : 'loading'}
            map={brMill as any}
            backgroundColor="transparent"
            regionStyle={{
            initial: {
                fill: '#d1d5db', 
            },
            }}
            series={{
            regions: [
                {
                attribute: 'fill',
                values: mapData?.values || {},
                scale: ['#FEF08A', '#B91C1C'], // Using a high-contrast yellow-to-red color scale
                normalizeFunction: 'polynomial',
                },
            ],
            }}
            onRegionTipShow={(event, el, code) => {
                const regionName = (brMill as any).content.paths[code]?.name || code;
                const revenue = mapData?.values[code.toLowerCase()] || 0;
                const formattedRevenue = revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                (el as any).html(`${regionName}: ${formattedRevenue}`);
            }}
        />
        </div>
    </div>
  );
};

export default SalesRegionMap;
