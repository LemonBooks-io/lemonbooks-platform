import React from "react";

export default function PaymentStatus({ status }) {
  return (
    <section className="py-4 ">
      <div className=" mx-auto ">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start lg:items-center">
            <svg
              className="flex-shrink-0 text-green-500 w-9 h-auto"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {
              <div className="ml-3">
                <h1 className="text-xl font-bold  text-gray-900 ">
                  Invoice Not Found
                </h1>

                <p className="mt-1 text-sm font-normal text-gray-600">
                  This means that either the invoice does not exist, or it is
                  for a bulk invoice payment that has already been submitted
                  successfully.
                </p>
              </div>
            }

            {status === "PAID" && (
              <div className="ml-3">
                <h1 className="text-xl font-bold  text-gray-900 ">
                  Payment Confirmed
                </h1>

                <p className="mt-1 text-sm font-normal text-gray-600">
                  We’ve received your payment proof and it has been approved.
                  Thank you!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
