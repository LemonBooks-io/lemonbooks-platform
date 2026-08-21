import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";

import React, { useEffect, useState } from "react";
import { CloseCircle } from "iconsax-react";
import axios from "axios";
import OrderType from "../orders/OrderType";
import SalesMonitor from "../orders/SalesMonitor";

import AccountTypeSelector from "../../components/AccountTypeSelector";

import LoadingModal from "../loading/LoadingModal";
import ProductList from "./ProductList";
import AddUpdateItem from "./AddUpdateItem";
import { getRequest } from "../../utils/fetch-function";

export default function ItemsDashboard() {
  const {
    isLogin,
    accessToken,
    isFetching,
    setIsFetching,
    updateData,
    setItems,
    setCategories,
  } = useStates();

  const [selectedTab, setSelectedTab] = useState("items");

  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    if (!isLogin) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await getRequest(
          "categories/getCategories",
          "offset=1&limit=20",
          accessToken
        );

        if (res) {
          setCategories(res?.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error; // Re-throw for error handling upstream
      }
    }
    fetchCategories();
  }, [selectedTab, updateData]);

  useEffect(() => {
    async function fetchItems() {
      try {
        setIsFetching(true);

        const res = await getRequest(
          "items/getItems",
          "offset=1&limit=20",
          accessToken
        );

        if (res) {


          setItems(res);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        throw error; // Re-throw for error handling upstream
      } finally {
        setIsFetching(false);
      }
    }
    fetchItems();
  }, [selectedTab, updateData]);

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

      <div className="flex flex-col  justify-center ">
        <div className="flex flex-1">
          <div className="flex flex-col flex-1 overflow-x-hidden">
            <main>
              <div className="pb-6  ">
                <div className="px-4 mx-auto sm:px-6 md:px-8">
                  <div className="space-y-2">
                    <div className="px-4 pt-5 mx-auto">
                      <div className="flex items-center  justify-between h-16">
                        <div className="flex items-end justify-between ">
                          <div className="flex justify-start gap-1 p-1 border border-dark-200 rounded-full">
                            <button
                              className={`text-black text-sm px-[15px] py-1 rounded-full font-bold ${
                                selectedTab === "items"
                                  ? "bg-gray-300 text-black "
                                  : ""
                              }`}
                              onClick={() => setSelectedTab("items")}
                            >
                              PRODUCTS & SERVICES
                            </button>
                            <button
                              className={`text-black text-sm px-[15px] py-1 rounded-full font-bold ${
                                selectedTab === "categories"
                                  ? "bg-gray-300 text-black "
                                  : ""
                              }`}
                              onClick={() => setSelectedTab("categories")}
                            >
                              CATEGORIES
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 mt-5 sm:gap-6 lg:grid-cols-6">
                      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl lg:col-span-4">
                        <div className="px-8 pb-2 pt-5">
                          <div className="sm:flex sm:items-start sm:justify-between">
                            {selectedTab === "items" && (
                              <div>
                                <p className="text-base font-bold text-gray-900">
                                  Products and Sevices List
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-500">
                                  All added products and items list
                                </p>
                              </div>
                            )}

                            {selectedTab === "categories" && (
                              <div>
                                <p className="text-base font-bold text-gray-900">
                                  Categories List
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-500">
                                  All added Categories
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <ProductList selectedTab={selectedTab} />
                      </div>

                      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl lg:col-span-2">
                        {/* <OrderType /> */}
                        {/* <SalesMonitor /> */}
                        <AddUpdateItem selectedTab={selectedTab} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
