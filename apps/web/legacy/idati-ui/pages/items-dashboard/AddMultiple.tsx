import React, { useState } from "react";

export default function AddMultiple({ addMultipleItems, setAddMultipleItems }) {
  const [isDataSaverOn, setIsDataSaverOn] = useState(false);

  return (
    <div className="pt-6 bg-white">
      <div className="px-7 mx-auto max-w-7xl ">
        <div className="max-w-sm mx-auto">
          <div className="space-y-5">
            {/* Data Saver Toggle - Off */}
            <div className="flex items-center">
              <button
                type="button"
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border border-gray-200 rounded-full cursor-pointer focus:outline-none transition-all duration-200 ${
                  addMultipleItems ? "bg-indigo-600" : "bg-gray-200"
                }`}
                role="switch"
                aria-checked={addMultipleItems}
                onClick={() => setAddMultipleItems(!addMultipleItems)}
              >
                <span
                  aria-hidden="true"
                  className={`inline-block w-3.5 h-3.5 mt-1 ml-1 transform rounded-full pointer-events-none transition-all duration-200 ${
                    addMultipleItems
                      ? "translate-x-5 bg-white"
                      : "translate-x-0 bg-gray-400"
                  }`}
                ></span>
              </button>
              <span className="ml-4">
                <span
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                  onClick={() => setAddMultipleItems(!addMultipleItems)}
                >
                  Add multiple Items
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
