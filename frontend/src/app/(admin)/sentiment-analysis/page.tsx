import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import SentimentDashboard from "@/components/predictive/SentimentDashboard";
import { FC } from "react";

const SentimentAnalysisPage: FC = () => {
  return (
    <>
      <PageBreadCrumb pageName="Sentiment Analysis" />

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12">
          <SentimentDashboard />
        </div>
      </div>
    </>
  );
};

export default SentimentAnalysisPage;
