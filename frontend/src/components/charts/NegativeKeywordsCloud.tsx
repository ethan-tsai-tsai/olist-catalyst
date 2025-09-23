'use client';
import { FC } from 'react';
import dynamic from 'next/dynamic';

// react-d3-cloud is not SSR-friendly
const WordCloud = dynamic(() => import('react-d3-cloud'), { ssr: false });

interface Word {
  text: string;
  value: number;
}

interface NegativeKeywordsCloudProps {
  words: Word[];
}

// d3-cloud calculates the font size based on the value, so we can define a mapper.
const fontSizeMapper = (word: Word) => Math.log2(word.value) * 5 + 16;

const NegativeKeywordsCloud: FC<NegativeKeywordsCloudProps> = ({ words }) => {

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Top Negative Keywords</h3>
      <div style={{ height: '300px', width: '100%' }}>
        {words.length > 0 ? (
            <WordCloud
                data={words}
                width={500} // These dimensions are often needed for initial render
                height={300}
                font="sans-serif"
                fontSize={fontSizeMapper}
                rotate={0}
                padding={2}
            />
        ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No keyword data available.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default NegativeKeywordsCloud;