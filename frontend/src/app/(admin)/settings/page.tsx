
'use client';

import Breadcrumb from "@/components/common/PageBreadCrumb";
import DefaultInputs from "@/components/form/form-elements/DefaultInputs";
import ToggleSwitch from "@/components/form/form-elements/ToggleSwitch";
import SelectInputs from "@/components/form/form-elements/SelectInputs";
import TextAreaInput from "@/components/form/form-elements/TextAreaInput";

const SettingsPage = () => {
  return (
    <>
      <Breadcrumb pageName="Settings" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          <DefaultInputs />
          <SelectInputs />
        </div>

        <div className="flex flex-col gap-9">
          <ToggleSwitch />
          <TextAreaInput />
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
