import { FC } from 'react';

interface Review {
  review_id: string;
  review_score: number;
  review_comment_message: string;
  sentiment_label: 'positive' | 'neutral' | 'negative' | 'no_comment' | 'error';
  sentiment_score: number | null;
  seller_id: string;
  review_creation_date: string;
}

interface RecentReviewsTableProps {
  reviews: Review[];
  title: string;
}

const sentimentColorMap = {
  positive: 'bg-green-500 text-white',
  neutral: 'bg-yellow-500 text-white',
  negative: 'bg-red-500 text-white',
  no_comment: 'bg-gray-400 text-gray-800',
  error: 'bg-purple-500 text-white',
};

const RecentReviewsTable: FC<RecentReviewsTableProps> = ({ reviews, title }) => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        {title}
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-12 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-12">
          <div className="p-2.5 xl:p-5 col-span-1">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Score</h5>
          </div>
          <div className="p-2.5 text-center col-span-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Comment</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block col-span-2">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Sentiment</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block col-span-2">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Seller</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block col-span-2">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Date</h5>
          </div>
        </div>

        {reviews.map((review, index) => (
          <div className="grid grid-cols-12 border-b border-stroke dark:border-strokedark sm:grid-cols-12" key={`${review.review_id}-${index}`}>
            <div className="flex items-center justify-center p-2.5 xl:p-5 col-span-1">
              <p className="text-black dark:text-white font-medium text-lg">{review.review_score} ★</p>
            </div>

            <div className="flex items-center p-2.5 xl:p-5 col-span-5">
              <p className="text-black dark:text-white text-sm">{review.review_comment_message}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 text-center sm:flex col-span-2">
               <span className={`px-3 py-1 text-xs font-medium rounded-full ${sentimentColorMap[review.sentiment_label] || 'bg-gray-400'}`}>
                 {review.sentiment_label.charAt(0).toUpperCase() + review.sentiment_label.slice(1)}
               </span>
            </div>
            <div className="hidden items-center justify-center p-2.5 text-center sm:flex col-span-2">
              <p className="text-black dark:text-white text-sm">{review.seller_id}</p>
            </div>
            <div className="hidden items-center justify-center p-2.5 text-center sm:flex col-span-2">
              <p className="text-black dark:text-white text-sm">{new Date(review.review_creation_date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentReviewsTable;
