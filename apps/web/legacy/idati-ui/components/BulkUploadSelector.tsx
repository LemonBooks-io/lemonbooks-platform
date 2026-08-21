import React, { useState } from "react";
import { useStates } from "../contexts/StatesContext";

export default function BulkUploadSelector() {
  const { isBulkUpload, setIsbulkUpload } = useStates();

  return (
    <div className=" ">
      <div className=" mx-auto max-w-7xl ">
        <div className="flex items-center justify-start flex  ">
          <button
            type="button"
            className={`relative inline-flex flex-shrink-0 h-6 transition-all duration-200 ease-in-out rounded-full cursor-pointer w-11 focus:outline-none ${
              isBulkUpload ? "bg-indigo-600" : "bg-gray-200"
            }`}
            role="switch"
            aria-checked={isBulkUpload}
            onClick={() => setIsbulkUpload(!isBulkUpload)}
          >
            <span
              aria-hidden="true"
              className={`inline-block w-3.5 h-3.5 mt-1 ml-1 transition duration-200 ease-in-out transform rounded-full pointer-events-none ring-0 ${
                isBulkUpload
                  ? "translate-x-5 bg-white"
                  : "translate-x-0 bg-gray-400"
              }`}
            ></span>
          </button>
          <span
            className="ml-4 cursor-pointer"
            onClick={() => setIsbulkUpload(!isBulkUpload)}
          >
            <span className="text-sm font-medium text-gray-900">
              Multiple Upload
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
