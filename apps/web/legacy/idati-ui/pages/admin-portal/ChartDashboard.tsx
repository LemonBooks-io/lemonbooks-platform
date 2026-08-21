import React from "react";
import Chart from "react-apexcharts";

const ChartDashboard = () => {
  const options = {
    chart: {
      type: "area",
      height: 250,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      curve: "smooth",
      lineCap: "butt",
      width: 2,
    },
    grid: {
      row: {
        colors: ["transparent"], // proper way
      },
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    yaxis: {
      show: false,
    },
    fill: {
      type: "solid",
      opacity: [0.05, 0],
    },
    colors: ["#4F46E5", "#818CF8"],
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
  };

  const series = [
    {
      name: "New user",
      data: [76, 85, 101, 98, 87, 105, 91, 114, 94, 76, 85, 101],
    },
    {
      name: "Returning user",
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66, 44, 55, 57],
    },
  ];

  return <Chart options={options} series={series} type="area" height={250} />;
};

export default ChartDashboard;
