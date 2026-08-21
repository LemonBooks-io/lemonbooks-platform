import React, { useState } from "react";

export default function CustomPaymentCard() {
  return (
    <section className="py-12 bg-white sm:py-16 lg:py-20">
      <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 mt-8 lg:grid-cols-5 lg:items-start xl:grid-cols-6 gap-y-10 lg:gap-x-12 xl:gap-x-16">
            <div className="lg:sticky lg:order-2 lg:top-6 lg:col-span-2">
              <div className="overflow-hidden rounded bg-gray-50">
                <div className="px-4 py-6 sm:p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-gray-900">
                    Order details
                  </h3>

                  <div className="flow-root mt-8">
                    <ul className="divide-y divide-gray-200 -my-7">
                      <li className="flex items-stretch justify-between space-x-5 py-7">
                        <div className="flex-shrink-0">
                          <img
                            className="object-cover w-16 h-16 rounded-lg"
                            src="https://cdn.rareblocks.xyz/collection/clarity-ecommerce/images/checkout/1/product-1.png"
                            alt=""
                          />
                        </div>

                        <div className="flex flex-col justify-between flex-1 ml-5">
                          <div className="flex-1">
                            <p className="text-base font-bold text-gray-900">
                              Apple Watch Series 7
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-500">
                              Golden
                            </p>
                          </div>
                          <p className="mt-2 text-sm font-bold text-gray-900">
                            $359
                          </p>
                        </div>

                        <div className="ml-auto">
                          <button
                            type="button"
                            className="inline-flex p-2 -m-2 text-gray-400 transition-all duration-200 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:text-gray-900"
                          >
                            <svg
                              className="w-5 h-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </li>

                      <li className="flex items-stretch justify-between space-x-5 py-7">
                        <div className="flex-shrink-0">
                          <img
                            className="object-cover w-16 h-16 rounded-lg"
                            src="https://cdn.rareblocks.xyz/collection/clarity-ecommerce/images/checkout/1/product-2.png"
                            alt=""
                          />
                        </div>

                        <div className="flex flex-col justify-between flex-1 ml-5">
                          <div className="flex-1">
                            <p className="text-base font-bold text-gray-900">
                              Beylob 90 Speaker
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-500">
                              Space Gray
                            </p>
                          </div>
                          <p className="mt-2 text-sm font-bold text-gray-900">
                            $49
                          </p>
                        </div>

                        <div className="ml-auto">
                          <button
                            type="button"
                            className="inline-flex p-2 -m-2 text-gray-400 transition-all duration-200 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:text-gray-900"
                          >
                            <svg
                              className="w-5 h-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <hr className="mt-6 border-gray-200" />

                  <div className="flow-root mt-5">
                    <div className="-my-5 divide-y divide-gray-200">
                      <div className="flex items-center justify-between py-5">
                        <p className="text-sm font-medium text-gray-600">
                          Subtotal
                        </p>
                        <p className="text-sm font-medium text-right text-gray-600">
                          $589
                        </p>
                      </div>

                      <div className="flex items-center justify-between py-5">
                        <p className="text-sm font-medium text-gray-600">Tax</p>
                        <p className="text-sm font-medium text-right text-gray-600">
                          $0
                        </p>
                      </div>

                      <div className="flex items-center justify-between py-5">
                        <p className="text-sm font-medium text-gray-600">
                          Shipping
                        </p>
                        <p className="text-sm font-medium text-right text-gray-600">
                          $10
                        </p>
                      </div>

                      <div className="flex items-center justify-between py-5">
                        <p className="text-sm font-bold text-gray-900">Total</p>
                        <p className="text-sm font-bold text-right text-gray-900">
                          $599
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center w-full px-6 py-4 text-sm font-bold text-white transition-all duration-200 bg-gray-900 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-700"
                    >
                      Confirm payment
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 lg:order-1 lg:col-span-3 xl:col-span-4">
              <div className="flow-root">
                <div className="divide-y divide-gray-200 -my-7">
                  <div className="py-7">
                    <h2 className="text-base font-bold text-gray-900">
                      Contact Information
                    </h2>

                    <div className="mt-6">
                      <label className="text-sm font-medium text-gray-600">
                        {" "}
                        Email address{" "}
                      </label>
                      <div className="mt-2">
                        <input
                          type="email"
                          id=""
                          name=""
                          placeholder=""
                          className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="py-7">
                    <h2 className="text-base font-bold text-gray-900">
                      Shipping Information
                    </h2>

                    <div className="grid grid-cols-1 mt-6 sm:grid-cols-2 gap-y-5 gap-x-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          {" "}
                          First name{" "}
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            id=""
                            name=""
                            placeholder=""
                            className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          {" "}
                          Last name{" "}
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            id=""
                            name=""
                            placeholder=""
                            className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-gray-600">
                          {" "}
                          Phone number{" "}
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            id=""
                            name=""
                            placeholder=""
                            className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-gray-600">
                          {" "}
                          Address line 1{" "}
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            id=""
                            name=""
                            placeholder=""
                            className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-gray-600">
                          {" "}
                          Address line 2{" "}
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            id=""
                            name=""
                            placeholder=""
                            className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          {" "}
                          Country{" "}
                        </label>
                        <div className="mt-2">
                          <select
                            id=""
                            name=""
                            className="block w-full py-3 pl-4 pr-10 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                          >
                            <option value="">United States</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          {" "}
                          City{" "}
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            id=""
                            name=""
                            placeholder=""
                            className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          {" "}
                          State{" "}
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            id=""
                            name=""
                            placeholder=""
                            className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          {" "}
                          Postal code{" "}
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            id=""
                            name=""
                            placeholder=""
                            className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-7">
                    <h2 className="text-base font-bold text-gray-900">
                      Payment
                    </h2>

                    <div className="mt-6 space-y-4">
                      <div className="bg-white border-2 border-gray-900 rounded-md">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center">
                            <div>
                              <span className="hidden">
                                <svg
                                  className="w-6 h-6 text-gray-300"
                                  viewBox="0 0 22 22"
                                  fill="none"
                                  stroke="currentColor"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="11"
                                    cy="11"
                                    r="10.25"
                                    strokeWidth="1.5"
                                  />
                                </svg>
                              </span>

                              <span>
                                <svg
                                  className="w-6 h-6"
                                  viewBox="0 0 22 22"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="11"
                                    cy="11"
                                    r="11"
                                    fill="#18181B"
                                  />
                                  <path
                                    d="M6.91699 11.5833L9.25033 13.9166L15.0837 8.08331"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>

                            <div className="ml-4">
                              <p className="text-base font-bold text-gray-900">
                                Credit Card
                              </p>
                              <p className="mt-1 text-sm font-medium text-gray-500">
                                Visa, Mastercard, American Amex
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 mt-5 sm:grid-cols-4 gap-x-6 gap-y-5">
                            <div className="col-span-2 sm:col-span-4">
                              <label className="text-sm font-medium text-gray-600">
                                {" "}
                                Card number{" "}
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  name=""
                                  id=""
                                  placeholder="XXXX XXXX XXXX XXXX"
                                  className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                                />
                              </div>
                            </div>

                            <div className="col-span-2">
                              <label className="text-sm font-medium text-gray-600">
                                {" "}
                                Name on the card{" "}
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  name=""
                                  id=""
                                  placeholder="ex: John Doe"
                                  className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                {" "}
                                Expiry date{" "}
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  name=""
                                  id=""
                                  placeholder="MM/YYYY"
                                  className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                {" "}
                                CSV{" "}
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  name=""
                                  id=""
                                  placeholder="XXX"
                                  className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-gray-200 rounded-md">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center">
                            <div>
                              <span>
                                <svg
                                  className="w-6 h-6 text-gray-300"
                                  viewBox="0 0 22 22"
                                  fill="none"
                                  stroke="currentColor"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="11"
                                    cy="11"
                                    r="10.25"
                                    strokeWidth="1.5"
                                  />
                                </svg>
                              </span>

                              <span className="hidden">
                                <svg
                                  className="w-6 h-6"
                                  viewBox="0 0 22 22"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="11"
                                    cy="11"
                                    r="11"
                                    fill="#18181B"
                                  />
                                  <path
                                    d="M6.91699 11.5833L9.25033 13.9166L15.0837 8.08331"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>

                            <div className="ml-4">
                              <p className="text-base font-bold text-gray-900">
                                PayPal
                              </p>
                              <p className="mt-1 text-sm font-medium text-gray-500">
                                One click PayPal payment
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-gray-200 rounded-md">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center">
                            <div>
                              <span>
                                <svg
                                  className="w-6 h-6 text-gray-300"
                                  viewBox="0 0 22 22"
                                  fill="none"
                                  stroke="currentColor"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="11"
                                    cy="11"
                                    r="10.25"
                                    strokeWidth="1.5"
                                  />
                                </svg>
                              </span>

                              <span className="hidden">
                                <svg
                                  className="w-6 h-6"
                                  viewBox="0 0 22 22"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="11"
                                    cy="11"
                                    r="11"
                                    fill="#18181B"
                                  />
                                  <path
                                    d="M6.91699 11.5833L9.25033 13.9166L15.0837 8.08331"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>

                            <div className="ml-4">
                              <p className="text-base font-bold text-gray-900">
                                Cryptocurrency
                              </p>
                              <p className="mt-1 text-sm font-medium text-gray-500">
                                Bitcoin, Ethereum
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
