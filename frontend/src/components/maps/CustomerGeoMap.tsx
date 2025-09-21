'use client';
import React, { useState, useEffect } from 'react';
import { VectorMap } from '@react-jvectormap/core';
import { worldMill } from '@react-jvectormap/world';

interface MapData {
    values: { [key: string]: number };
}

const CustomerGeoMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/overview/customer_geo_map');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: MapData = await response.json();
        setMapData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading Map...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ width: '100%', height: 384 }}>
      <VectorMap
        map={worldMill}
        backgroundColor="transparent"
        regionStyle={{
          initial: {
            fill: '#d1d5db', // A neutral color for countries with no data
          },
        }}
        series={{
          regions: [
            {
              values: mapData?.values || {},
              scale: ['#C8EEFF', '#0071A4'], // Color scale from light blue to dark blue
              normalizeFunction: 'polynomial',
            },
          ],
        }}
        onRegionTipShow={(event, el, code) => {
            const regionData = (el as any).element.properties.regionData;
            if (regionData) {
                el.html(el.html() + ': ' + regionData.value + ' customers');
            }
        }}
      />
    </div>
  );
};

export default CustomerGeoMap;
