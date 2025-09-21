
'use client';

import Breadcrumb from "@/components/common/PageBreadCrumb";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";

const ProfilePage = () => {
  return (
    <>
      <Breadcrumb pageName="Profile" />

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-4">
            <UserInfoCard />
        </div>
        <div className="col-span-12 xl:col-span-8">
            <UserAddressCard />
        </div>
        <div className="col-span-12">
            <UserMetaCard />
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
