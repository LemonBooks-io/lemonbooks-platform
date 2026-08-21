import React, { useEffect, useState } from "react";
import { DateRange } from "react-date-range";
import { v4 as uuidv4 } from "uuid";
import "react-date-range/dist/styles.css"; // Main CSS file
import "react-date-range/dist/theme/default.css"; // Theme CSS file

const DateRangeSelector = ({ setRefresh, dateRange, setDateRange }) => {
  const [showPicker, setShowPicker] = useState(false);

  function togglePicker() {
    setShowPicker(!showPicker);
  }

  function handleSave() {
    setRefresh(uuidv4());
    setShowPicker(!showPicker);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={togglePicker}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        <svg
          className="w-5 h-5 mr-2 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {`${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`}
      </button>

      {showPicker && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setDateRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            className="p-4"
          />
          <div className="flex items-center justify-end px-4 py-2 border-t">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
