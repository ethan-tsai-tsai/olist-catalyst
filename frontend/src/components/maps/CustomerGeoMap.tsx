'use client';
import React, { useState, useEffect } from 'react';
import { VectorMap } from '@react-jvectormap/core';
import { brMill } from '@react-jvectormap/brazil';

interface MapData {
    values: { [key: string]: number };
}

const CustomerGeoMap: React.FC<{ sellerId: string | null }> = ({ sellerId }) => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!sellerId) {
        setLoading(false);
        setMapData(null);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/sellers/${sellerId}/customer_geo_map`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: MapData = await response.json();
        setMapData(data);
      } catch (error) {
        console.error("Failed to load map data:", error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sellerId]);

  if (loading) return <div>Loading Map...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ width: '100%', height: 384 }}>
      <VectorMap
        map={brMill}
        backgroundColor="transparent"
        regionStyle={{
          initial: {
            fill: '#d1d5db', 
          },
        }}
        series={{
          regions: [
            {
              values: mapData?.values || {},
              scale: ['#c8e6c9', '#1b5e20'],
              normalizeFunction: 'polynomial',
            },
          ],
        }}
        onRegionTipShow={(event, el, code) => {
            el.html(el.html() + ': ' + (mapData?.values[code] || 0) + ' customers');
        }}
      />
    </div>
  );
};

export default CustomerGeoMap;
