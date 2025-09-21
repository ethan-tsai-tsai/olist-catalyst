
'use client';

import Breadcrumb from "@/components/common/PageBreadCrumb";
import dynamic from 'next/dynamic';

const Calendar = dynamic(() => import('@/components/calendar/Calendar'), { ssr: false });

const CalendarPage = () => {
  return (
    <>
      <Breadcrumb pageName="Calendar" />

      <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <Calendar />
      </div>
    </>
  );
};

export default CalendarPage;
