'use client';
import { FC } from 'react';
import { VectorMap } from '@react-jvectormap/core';
import * as brazil from '@react-jvectormap/brazil';

interface SentimentGeoMapProps {
  data: { [key: string]: number };
}

const SentimentGeoMap: FC<SentimentGeoMapProps> = ({ data }) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Sentiment by State</h3>
      <div style={{ width: '100%', height: '350px' }}>
        <VectorMap
          map={brazil.brMill}
          backgroundColor="transparent"
          series={{
            regions: [
              {
                values: data,
                scale: ['#E2F3E8', '#1A9641'], // Light green to dark green
                normalizeFunction: 'polynomial',
              },
            ],
          }}
          onRegionTipShow={(_, tip, code) => {
            const stateName = brazil.brMill.paths[code].name;
            const score = data[code] ? data[code].toFixed(2) : 'N/A';
            tip.html(`${stateName}: ${score}`);
          }}
        />
      </div>
    </div>
  );
};

export default SentimentGeoMap;
