import { useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import TemplateMenu from "./TemplateMenu";

export default function InvoiceEstimateTopInfo({ type }) {
  const [nextInvoiceNo, setNextInvoiceNo] = useState("");
  const { userProfile } = useStates();
  return (
    <div className="">
      <div className="grid grid-cols-1 mt-6 sm:grid-cols-2 gap-y-5 gap-x-6">
        <div className="grid grid-cols-8 col-span-2 w-full gap-x-6 ">
          <div className=" col-span-1 flex items-end ">
            <h2 className="text-base font-bold text-gray-900">{type} Info</h2>
          </div>

          <div className=" col-span-7 flex items-end ">
            <TemplateMenu />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 mt-6 sm:grid-cols-2 gap-y-5 gap-x-6">
        <div className="grid sm:grid-cols-2 col-span-2 w-full gap-x-6 gap-y-2">
          <div className=" col-span-1  ">
            <label className="text-sm font-medium text-gray-600">
              {" "}
              {type} No.
            </label>
            <div className="mt-2">
              <div className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
                {nextInvoiceNo || "000000"}
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <label className="text-sm font-medium text-gray-600">
              {" "}
              Prepared By
            </label>
            <div className="mt-2">
              <div className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
                {userProfile?.user?.name || "*****"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 col-span-2 w-full gap-x-6 gap-y-2">
          <div className="col-span-1">
            <label
              htmlFor="due-date"
              className="text-sm font-medium text-gray-600"
            >
              {type} Date
            </label>
            <div className="mt-2">
              <input
                onChange={(e) => setDueDate(e.target.value)}
                type="date"
                id="invoice-estimate-date"
                name="invoice-estimate-date"
                defaultValue={
                  new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                } // Set today's date as default
                className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
          </div>

          <div className="col-span-1">
            <label
              htmlFor="expiry-date"
              className="text-sm font-medium text-gray-600"
            >
              Expiry Date
            </label>
            <div className="mt-2">
              <input
                onChange={(e) => setExpiryDate(e.target.value)}
                type="date"
                id="expiry-date"
                name="expiry-date"
                defaultValue={
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                } // Set date to a week from today
                className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
