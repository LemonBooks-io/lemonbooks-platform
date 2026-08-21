import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const OrderType = () => {
  const [chart2Options, setChart2Options] = useState({
    chart: {
      type: "donut",
      width: "100%", // Set the width to 100% for responsive behavior
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: "60%",
          labels: {
            show: true,
          },
        },
      },
    },
    series: [68, 22, 10], // Data for the chart
    labels: ["Direct Source", "Referral", "Social"],
    colors: ["#4F46E5", "#C7D2FE", "#E0E7FF"], // Donut chart slice colors
    legend: {
      position: "bottom",
      markers: {
        radius: 12,
        offsetX: -4,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 20,
      },
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
    },
  });

  return (
    <div className="py-12 bg-white">
      <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className="max-w-md mx-auto">
          <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
            <div className="px-4 py-5 sm:p-6">
              <div className="sm:flex sm:items-center sm:justify-between">
                <p className="text-base font-bold text-gray-900">
                  Income Breakdown
                </p>
              </div>

              {/* Chart rendering */}
              <div id="chart2" className="mt-6">
                <ReactApexChart
                  options={chart2Options}
                  series={chart2Options.series}
                  type="donut"
                  width={375} // Ensure it takes the full available width
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderType;
