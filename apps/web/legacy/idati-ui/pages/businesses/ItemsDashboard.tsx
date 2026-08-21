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
import ProductCategoryTabs from "./ProductCategoryTabs";

export default function ItemsDashboard() {
  const {
    isLogin,
    accessToken,
    isFetching,
    setIsFetching,
    updateData,
    setItems,
    setCategories,
    productCategoryTab,
    setProductCategoryTab,
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

      <div className="flex flex-col  justify-center w-full ">
        <div className="flex flex-1">
          <div className="flex flex-col flex-1 overflow-x-hidden">
            <main>
              <div className="pb-6  ">
                <div className="px-4 mx-auto sm:px-6 md:px-8">
                  <div className="space-y-2">
                    <div className=" pt-5  mx-auto">
                      <ProductCategoryTabs />
                    </div>
                    <div className="grid grid-cols-1 gap-5 mt-5 sm:gap-6 lg:grid-cols-6 bg-black">
                      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl lg:col-span-6 ">
                        <div className="px-8 pb-2 pt-5">
                          <div className="sm:flex sm:items-start sm:justify-between">
                            {productCategoryTab === "PRODUCT" && (
                              <div>
                                <p className="text-base font-bold text-gray-900">
                                  Products and Sevices List
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-500">
                                  All added products and items list
                                </p>
                              </div>
                            )}

                            {productCategoryTab === "CATEGORY" && (
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

                        <ProductList productCategoryTab={productCategoryTab} />
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
