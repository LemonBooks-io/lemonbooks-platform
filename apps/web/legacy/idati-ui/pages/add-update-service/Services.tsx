import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";

import React, { useEffect, useState } from "react";
import { CloseCircle } from "iconsax-react";
import axios from "axios";
import OrderType from "../orders/OrderType";
import SalesMonitor from "../orders/SalesMonitor";

import AccountTypeSelector from "../../components/AccountTypeSelector";

import ServicesList from "./ServicesList";
import AddUpdateService from "./AddUpdateService";
import LoadingModal from "../loading/LoadingModal";

export default function Services() {
  const {
    isLogin,
    BASE_URL,
    selectedOrder,
    setSelectedOrder,
    orders,
    setOrders,
    formatDate,
    accountType,
    setAccountType,
    accessToken,
    allClients,
    setAllClients,
    allServices,
    setAllServices,
    isFetching,
    setIsFetching,
    updateData,
  } = useStates();

  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    if (!isLogin) {
      navigate("/");
    }
  }, []);

  function goBackHandler() {
    if (location.pathname === "/orders") {
      navigate("/");
    } else {
      navigate(-1); // Correct: navigate back by 1 step in history}
    }
  }
  return (
    <div className="flex justify-center  w-full ">
      <LoadingModal />
      {!isFetching && (
        <div className="flex flex-col  justify-center ">
          <div className="flex flex-1">
            <div className="flex flex-col flex-1 overflow-x-hidden">
              <main>
                <div className="pb-6  ">
                  <div className="px-4 mx-auto sm:px-6 md:px-8">
                    <div className="space-y-2">
                      <div className="px-4  mx-auto">
                        <div className="flex items-center  justify-between h-16"></div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 mt-5 sm:gap-6 lg:grid-cols-6">
                        <div className="overflow-hidden bg-white border border-gray-200 rounded-xl lg:col-span-4">
                          <div className="px-8 pb-2 pt-5">
                            <div className="sm:flex sm:items-start sm:justify-between">
                              <div>
                                <p className="text-base font-bold text-gray-900">
                                  Services List
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-500">
                                  All existing services are as follows
                                </p>
                              </div>
                            </div>
                          </div>

                          <ServicesList />

                          <div className="divide-y divide-gray-200">
                            {(location.pathname === "/orders" ||
                              location.pathname === "/orders/") &&
                              orders?.slice(0, 10).map((order, index) => (
                                <NavLink
                                  onClick={() =>
                                    setSelectedOrder(
                                      orders.find(
                                        (q) =>
                                          q.orderItems.invoiceNumber ===
                                          order.orderItems.invoiceNumber
                                      )
                                    )
                                  }
                                  key={index}
                                  to={`/orders/${order.orderItems.invoiceNumber}`}
                                  title=""
                                  className="relative overflow-hidden transition-all duration-200 bg-gray-100 rounded-xl hover:bg-gray-200"
                                  // onClick={() =>
                                  //   setSelectedQuest(allQuests.find((q) => q.id === quest.id))
                                  // }
                                >
                                  <div
                                    key={index}
                                    className="grid grid-cols-3 lg:gap-0 lg:grid-cols-6"
                                  >
                                    <div className=" col-span-2 px-4 lg:py-4 sm:px-6 lg:col-span-1">
                                      <span className="text-xs font-medium text-green-900 bg-green-100 rounded-full inline-flex items-center px-2.5 py-1">
                                        <svg
                                          className="-ml-1 mr-1.5 h-2.5 w-2.5 text-green-500"
                                          fill="currentColor"
                                          viewBox="0 0 8 8"
                                        >
                                          <circle cx="4" cy="4" r="3"></circle>
                                        </svg>
                                        {order.orderItems.invoiceNumber.slice(
                                          -8
                                        )}
                                      </span>
                                    </div>

                                    <div className="px-4 text-right lg:py-4 sm:px-6 lg:order-last">
                                      <button
                                        type="button"
                                        className="inline-flex items-center justify-center w-8 h-8 text-gray-400 transition-all duration-200 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                                      >
                                        <svg
                                          className="w-6 h-6"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                                          ></path>
                                        </svg>
                                      </button>
                                    </div>

                                    <div className="px-4 lg:py-4 flex flex-wrap w-[250px] sm:px-6 lg:col-span-2">
                                      {order?.orderItems?.items.map(
                                        (item, index) => (
                                          <p
                                            key={index}
                                            className="pr-1 flex text-xs font-medium text-gray-500"
                                          >
                                            {item.quantity} {item.description},
                                          </p>
                                        )
                                      )}
                                    </div>

                                    <div className="px-4 lg:py-4 sm:px-6">
                                      <p className="text-sm font-bold text-gray-900">
                                        {order.orderItems.currency}{" "}
                                        {order.orderItems.totalAmount}
                                      </p>
                                      <p className="mt-1 text-xs font-medium text-gray-500">
                                        {formatDate(
                                          order.orderItems.transactionDate
                                        )}
                                      </p>
                                    </div>

                                    <div className="px-4 lg:py-4 sm:px-6">
                                      <p className="mt-1 text-sm font-medium text-gray-500">
                                        Amazon
                                      </p>
                                    </div>
                                  </div>
                                </NavLink>
                              ))}
                            <Outlet />
                          </div>
                        </div>

                        <div className="overflow-hidden bg-white border border-gray-200 rounded-xl lg:col-span-2">
                          {/* <div className="px-4 py-5 sm:p-6">
                          <div className="sm:flex sm:items-center sm:justify-between">
                            <p className="text-base font-bold text-gray-900">
                              Popular days
                            </p>

                            <div className="mt-4 sm:mt-0">
                              <div>
                                <label className="sr-only"> Duration </label>
                                <select
                                  name=""
                                  id=""
                                  className="block w-full py-0 pl-0 pr-10 text-base border-none rounded-lg focus:outline-none focus:ring-0 sm:text-sm"
                                >
                                  <option>Last 7 days</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 space-y-6">
                            <div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  Monday
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  1,43,382
                                </p>
                              </div>
                              <div className="mt-2 bg-gray-200 h-1.5 rounded-full relative">
                                <div className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full w-[60%]"></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  Tuesday
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  87,974
                                </p>
                              </div>
                              <div className="mt-2 bg-gray-200 h-1.5 rounded-full relative">
                                <div className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full w-[50%]"></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  Wednesday{" "}
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  45,211
                                </p>
                              </div>
                              <div className="mt-2 bg-gray-200 h-1.5 rounded-full relative">
                                <div className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full w-[30%]"></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  Thursday
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  21,893
                                </p>
                              </div>
                              <div className="mt-2 bg-gray-200 h-1.5 rounded-full relative">
                                <div className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full w-[15%]"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  Friday
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  21,893
                                </p>
                              </div>
                              <div className="mt-2 bg-gray-200 h-1.5 rounded-full relative">
                                <div className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full w-[15%]"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  Saturday
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  21,893
                                </p>
                              </div>
                              <div className="mt-2 bg-gray-200 h-1.5 rounded-full relative">
                                <div className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full w-[15%]"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  Sunday
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  21,893
                                </p>
                              </div>
                              <div className="mt-2 bg-gray-200 h-1.5 rounded-full relative">
                                <div className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full w-[15%]"></div>
                              </div>
                            </div>
                          </div>
                        </div> */}
                          {/* <OrderType /> */}
                          {/* <SalesMonitor /> */}
                          <AddUpdateService />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
