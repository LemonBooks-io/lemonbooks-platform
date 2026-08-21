import React, { useState } from "react";

export default function RememberPc({
  rememberPcSelected,
  setRememberPcSelected,
}) {
  return (
    <div className="mt-4">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center">
          <div className="flex  items-start">
            <div className="mr-3">
              <label
                htmlFor="public"
                className="text-sm font-medium text-[#4d5c56] cursor-pointer"
              >
                Trust this device for future sign-ins
              </label>
            </div>

            <div className="flex items-center  h-5 pt-1.5">
              <input
                value={rememberPcSelected}
                type="checkbox"
                name="visibility"
                id="public"
                className="w-4 h-4 accent-[#174c3c] border-gray-300 focus:ring-0"
                onChange={(e) => setRememberPcSelected(e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
