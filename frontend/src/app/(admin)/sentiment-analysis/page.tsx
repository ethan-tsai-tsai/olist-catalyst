import SentimentDashboard from "@/components/predictive/SentimentDashboard";
import { FC } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Feedback Analysis",
};

const SentimentAnalysisPage: FC = () => {
  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Customer Feedback Analysis</h1>
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12">
          <SentimentDashboard />
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysisPage;