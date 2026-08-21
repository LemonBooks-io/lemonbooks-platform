import React, { useState } from "react";
import { useStates } from "../contexts/StatesContext";
import { postRequest } from "../utils/fetch-function";

export default function TabEnabler() {
  const { setIsEnabled, businessInfo, userProfile, toast, triggerUpdate } =
    useStates();

  const isEnabled = businessInfo?.enableTapPayment;

  async function handleEnable() {
    const res = await postRequest(
      `business/enable-tap-payment?enable=${!isEnabled}`,
      {},
      userProfile?.accessToken,
      ""
    );

    if (res) {
      toast?.success(res?.message);

      let businessDetails = JSON.parse(localStorage.getItem("businessInfo"));
      businessDetails.enableTapPayment = !isEnabled;

      localStorage.setItem("businessInfo", JSON.stringify(businessDetails));

      triggerUpdate();
    }
  }

  return (
    <div className=" ">
      <div className=" mx-auto max-w-7xl ">
        <div className="flex items-center justify-start   ">
          <span className="cursor-pointer">
            <span className="text-sm font-medium text-gray-900">
              {isEnabled ? "Enabled" : "Disabled"}
            </span>
          </span>
          <button
            type="button"
            className={`ml-4  relative inline-flex flex-shrink-0 h-6 transition-all duration-200 ease-in-out rounded-full cursor-pointer w-11 focus:outline-none ${
              isEnabled ? "bg-indigo-600" : "bg-gray-200"
            }`}
            role="switch"
            aria-checked={isEnabled}
            // onClick={() => setIsbulkUpload(!isBulkUpload)}
            onClick={handleEnable}
          >
            <span
              aria-hidden="true"
              className={`inline-block w-3.5 h-3.5 mt-1 ml-1 transition duration-200 ease-in-out transform rounded-full pointer-events-none ring-0 ${
                isEnabled
                  ? "translate-x-5 bg-white"
                  : "translate-x-0 bg-gray-400"
              }`}
            ></span>
          </button>
        </div>
      </div>
    </div>
  );
}
