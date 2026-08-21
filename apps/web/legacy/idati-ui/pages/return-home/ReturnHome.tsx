import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ReturnHome({ message = "Page not found!!!" }) {
  const navigate = useNavigate();

  function returnHomeHandler() {
    navigate("/");
  }
  return (
    <div className="overflow-x-hidden flex  h-screen justify-center ">
      <section className=" mb-5 flex items-center relative ">
        <div className="relative px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <div className=" max-w-3xl mx-auto items-center text-center">
            <div className=" flex flex-row justify-center text-center items-center gap-1 ">
              <h1 className="text-3xl font-normal leading-tight text-gray-900 lg:leading-tight font-pj">
                {message}
              </h1>
            </div>

            <div className="relative inline-flex mt-5 group">
              <button
                onClick={returnHomeHandler}
                className="inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-md focus:outline-none hover:bg-blue-700 focus:bg-blue-700"
              >
                Return to home page
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
