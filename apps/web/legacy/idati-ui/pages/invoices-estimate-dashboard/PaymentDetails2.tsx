import React from "react";

export default function PaymentDetails2() {
  return (
    <section className="py-12 bg-white ">
      <div className="px-4 mx-auto ">
        <div className=" mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-gray-900">
              Payment Details for Invoice INV_123
            </p>

            <p className="text-xl font-medium text-gray-500">364/1000</p>
          </div>

          <div className="mt-6 overflow-hidden bg-white border border-gray-200 md:mt-8 rounded-xl">
            <div className="md:flex">
              <div className="md:max-w-xs">
                <img
                  className="object-cover w-full h-full"
                  src="https://landingfoliocom.imgix.net/store/collection/niftyui/images/mint/2/image.png"
                  alt=""
                />
              </div>

              <div className="flex flex-col justify-between flex-1 p-6 sm:p-8">
                <div className="space-y-6">
                  <div className="grid items-center grid-cols-2 gap-6">
                    <label
                      for=""
                      className="text-base font-medium text-gray-900"
                    >
                      Select Quantity:
                    </label>

                    <div className="">
                      <select
                        name=""
                        id=""
                        className="block w-full py-2 pl-4 text-base font-medium text-gray-900 border-gray-200 rounded-lg"
                      >
                        <option value="">1</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid items-center grid-cols-2 gap-6">
                    <span className="text-base font-medium text-gray-900">
                      Mint Cost:
                    </span>

                    <div className="px-4 py-2 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between space-x-8">
                        <span className="text-base font-medium text-gray-900">
                          0.547
                        </span>

                        <span className="text-base font-medium text-gray-400">
                          EFT
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 space-y-5 text-center md:mt-0">
                  <p className="text-base font-medium text-gray-500">
                    Wallet Balance:{" "}
                    <span className="text-gray-900">3.925 EFT</span>
                  </p>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-full px-6 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-gray-900 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-700"
                  >
                    Mint
                  </button>

                  <p className="text-sm font-medium text-gray-400">
                    Tips: Lorem ipsum dolor sit amet, consectetur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
