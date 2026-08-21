import React, { useState } from "react";
import { useStates } from "../contexts/StatesContext";

export default function AccountTypeSelector() {
  const { accountType, setAccountType } = useStates();

  return (
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8  ">
      <div className="max-w-sm mx-auto">
        <div className=" flex justify-between items-center mt-10 ">
          <div className="flex  items-start">
            <div className="flex items-center  h-5 pt-1.5">
              <input
                type="radio"
                name="visibility"
                id="public"
                className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-0"
                checked={accountType === 0}
                onChange={() => setAccountType(0)}
              />
            </div>

            <div className="ml-4">
              <label
                htmlFor="public"
                className="text-sm font-bold text-gray-900 cursor-pointer"
              >
                Client user
              </label>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5 pt-1.5">
              <input
                type="radio"
                name="visibility"
                id="private"
                className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-0"
                checked={accountType === 1}
                onChange={() => setAccountType(1)}
              />
            </div>

            <div className="ml-4">
              <label
                htmlFor="private"
                className="text-sm font-bold text-gray-900 cursor-pointer"
              >
                Admin user
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
