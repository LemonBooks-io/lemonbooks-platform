import React from "react";
import ReactApexChart from "react-apexcharts";

class SalesMonitor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			chart5Options: {
				chart: {
					type: "bar",
					height: 250,
					toolbar: {
						show: false,
					},
				},
				width: "10%", // Ensures the chart width adapts
				height: "100%", // Ensures the chart height adapts
				grid: {
					show: false,
				},
				plotOptions: {
					bar: {
						horizontal: false,
						columnWidth: "60%",
						endingShape: "rounded",
						borderRadius: 3,
					},
				},
				dataLabels: {
					enabled: false,
				},
				stroke: {
					show: true,
					width: 4,
					colors: ["transparent"],
				},
				xaxis: {
					categories: ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"],
				},
				yaxis: {
					show: true,
					labels: {
						formatter: function (val) {
							return val.toFixed(0); // Format y-axis values
						},
					},
				},
				fill: {
					opacity: 1,
				},
				colors: ["#4F46E5", "#E4E4E7"], // Colors for Total Sales and Order Count
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
			},
			series: [
				{
					name: "Total Sales",
					data: [44, 55, 77, 87, 61, 58, 35],
				},
				{
					name: "Order Count",
					data: [30, 45, 65, 70, 50, 40, 25], // Add data for Order Count
				},
			],
		};
	}

	render() {
		return (
			<div className="py-6 bg-white">
				<div className="px-4 mx-auto sm:px-6 lg:px-8 ">
					<div className="max-w-lg mx-auto">
						<div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
							<div className="px-4 pt-5 sm:px-6">
								<div className="sm:flex sm:items-center sm:justify-between">
									<p className="text-base font-bold text-gray-900">
										Sales Monitor
									</p>
								</div>

								<div className="mt-4">
									<ReactApexChart
										options={this.state.chart5Options}
										series={this.state.series}
										type="bar"
										height={250}
										width={375}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default SalesMonitor;
