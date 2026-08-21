import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";

import React, { useEffect, useState } from "react";
import { CloseCircle } from "iconsax-react";
import axios from "axios";
import SalesMonitor from "./SalesMonitor";
import OrderType from "./OrderType";
import LoadingModal from "../loading/LoadingModal";
import DateRangeSelector from "./DateRangeSelector";

export default function OrderData() {
	const {
		isLogin,
		BASE_URL,
		selectedOrder,
		setSelectedOrder,
		orders,
		setOrders,
		formatDate,
		isFetching,
		setIsFetching,
		accessToken,
	} = useStates();
	const navigate = useNavigate();
	const today = new Date();
	const [dateRange, setDateRange] = useState([
		{
			startDate: new Date(today.getFullYear(), 0, 1),
			endDate: today,
			key: "selection",
		},
	]);
	// const [selectedRange, setSelectedRange] = useState("");
	const [refresh, setRefresh] = useState("");

	function convertToUTC(dateString) {
		// Create a Date object from the input string
		const date = new Date(dateString);

		// Check if the date is valid
		if (isNaN(date.getTime())) {
			throw new Error("Invalid date format");
		}

		// Convert to ISO string (UTC format)
		return date.toISOString();
	}

	const selectedRange = `${convertToUTC(dateRange[0].startDate)},${convertToUTC(
		dateRange[0].endDate
	)}`;

	const location = useLocation();

	useEffect(() => {
		if (!isLogin) {
			navigate("/");
		}
	}, []);

	useEffect(() => {
		async function fetchOrders() {
			const headers = {
				Authorization: `Bearer ${accessToken}`, // Token added in headers
				"Content-Type": "application/json",
			};
			try {
				setIsFetching(true);
				const offsetVal = 1;

				const res = await axios.get(
					`${BASE_URL}/api/v1/admin/orders/all?offset=${offsetVal}&limit=20&createdAt_range=${selectedRange}`,
					// `https://revel-usr-mgt-35d7e8b68cc0.herokuapp.com/api/v1/admin/orders/all?offset=1&limit=20&createdAt_range=2025-01-05T08:10:24.941Z,2025-01-08T08:10:24.941Z`
					{ headers } // Configuration object with headers
				);

				const orders = res?.data?.data;

				setOrders(orders);
			} catch (error) {
				console.error("Error fetching profile:", error);
				throw error; // Re-throw for error handling upstream
			} finally {
				setIsFetching(false);
			}
		}
		fetchOrders();
	}, [refresh]);

	function goBackHandler() {
		if (location.pathname === "/orders") {
			navigate("/");
		} else {
			navigate(-1); // Correct: navigate back by 1 step in history}
		}
	}
	return (
		<div className="flex justify-center  w-full">
			<LoadingModal />
			{!isFetching && (
				<div className="flex flex-col  justify-center">
					<header className="    border-gray-200">
						<div className="px-8 my-6  flex justify-between mx-auto ">
							<div className="md:items-center md:flex">
								<p className="text-base font-bold text-gray-900">
									Hey Mariana -
								</p>
								<p className="mt-1 text-base font-medium text-gray-500 md:mt-0 md:ml-2">
									here's what's happening with your store today
								</p>
							</div>

							<div className="flex items-center justify-end ml-auto  space-x-5">
								<div className="relative">
									<button
										type="button"
										className="p-1 text-gray-700 transition-all duration-200 bg-white rounded-full hover:text-gray-900 focus:outline-none hover:bg-gray-100"
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
												d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
											></path>
										</svg>
									</button>
								</div>
								<div className="relative">
									<CloseCircle
										size="32"
										className=" text-gray-600  cursor-pointer"
										onClick={goBackHandler}
									/>
								</div>
							</div>
						</div>
					</header>

					<div className="flex flex-1">
						<div className="flex flex-col flex-1 overflow-x-hidden">
							<main>
								<div className="pb-6 mt-4">
									<div className="px-4 mx-auto sm:px-6 md:px-8">
										<div className="space-y-2">
											<div className="grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
												<div className="bg-white border border-gray-200 rounded-xl">
													<div className="px-5 py-4">
														<p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
															Sales Amount
														</p>
														<div className="flex items-center justify-between mt-3">
															<p className="text-xl font-bold text-gray-900">
																${orders?.totalAmount?.toFixed(3)}
															</p>

															<span className="inline-flex items-center text-sm font-semibold text-green-500">
																+ 36%
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	className="w-3 h-3 ml-0.5"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																	strokeWidth="3"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="M7 11l5-5m0 0l5 5m-5-5v12"
																	></path>
																</svg>
															</span>
														</div>
													</div>
												</div>

												<div className="bg-white border border-gray-200 rounded-xl">
													<div className="px-5 py-4">
														<p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
															No. of Orders
														</p>
														<div className="flex items-center justify-between mt-3">
															<p className="text-xl font-bold text-gray-900">
																{orders?.totalOrders}
															</p>

															<span className="inline-flex items-center text-sm font-semibold text-red-500">
																- 14%
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	className="w-3 h-3 ml-0.5"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																	strokeWidth="3"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="M17 13l-5 5m0 0l-5-5m5 5V6"
																	/>
																</svg>
															</span>
														</div>
													</div>
												</div>

												<div className="bg-white border border-gray-200 rounded-xl">
													<div className="px-5 py-4">
														<p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
															Total Vats
														</p>
														<div className="flex items-center justify-between mt-3">
															<p className="text-xl font-bold text-gray-900">
																${orders?.totalVat?.toFixed(3)}
															</p>

															<span className="inline-flex items-center text-sm font-semibold text-green-500">
																+ 36%
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	className="w-3 h-3 ml-0.5"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																	strokeWidth="3"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="M7 11l5-5m0 0l5 5m-5-5v12"
																	></path>
																</svg>
															</span>
														</div>
													</div>
												</div>

												<div className="bg-white border border-gray-200 rounded-xl">
													<div className="px-5 py-4">
														<p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
															Total Customers
														</p>
														<div className="flex items-center justify-between mt-3">
															<p className="text-xl font-bold text-gray-900">
																33,493
															</p>

															<span className="inline-flex items-center text-sm font-semibold text-green-500">
																+ 36%
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	className="w-3 h-3 ml-0.5"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																	strokeWidth="3"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="M7 11l5-5m0 0l5 5m-5-5v12"
																	></path>
																</svg>
															</span>
														</div>
													</div>
												</div>
											</div>

											<div className="px-1 pt-5 mx-auto grid grid-cols-1  lg:grid-cols-6 gap-5 sm:gap-6 ">
												<div className="flex justify-between h-16     lg:col-span-4 items-center">
													<div className=" flex-1  hidden max-w-xs  mr-auto lg:block">
														<label className="sr-only"> Search </label>
														<div className="relative">
															<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
																<svg
																	className="w-5 h-5 text-gray-400"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																	strokeWidth="2"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
																	></path>
																</svg>
															</div>

															<input
																type="search"
																name=""
																id=""
																className="block w-full py-2 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
																placeholder="Type to search"
															/>
														</div>
													</div>

													<div className="flex items-center justify-end  space-x-5">
														<DateRangeSelector
															selectedRange={selectedRange}
															setRefresh={setRefresh}
															dateRange={dateRange}
															setDateRange={setDateRange}
														/>
														{/* export as csv */}
														{/* <div className="relative">
                              {" "}
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm lg:order-2 2xl:order-3 md:order-last hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                              >
                                <svg
                                  className="w-4 h-4 mr-1 -ml-1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                Export to CSV
                              </button>
                            </div> */}
													</div>
												</div>
											</div>

											<div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-6">
												<div className="overflow-hidden bg-white border border-gray-200 rounded-xl lg:col-span-4">
													<div className="px-4 py-5 sm:p-6">
														<div className="sm:flex sm:items-start sm:justify-between">
															<div>
																<p className="text-base font-bold text-gray-900">
																	Transactions
																</p>
																<p className="mt-1 text-sm font-medium text-gray-500">
																	List of most recent transactions can be found
																	here:
																</p>
															</div>

															<div className="mt-4 sm:mt-0">
																<a
																	href="#"
																	title=""
																	className="inline-flex items-center text-xs font-semibold tracking-widest text-gray-500 uppercase hover:text-gray-900"
																>
																	See all Transactions
																	<svg
																		className="w-4 h-4 ml-2"
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke="currentColor"
																		strokeWidth="2"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			d="M9 5l7 7-7 7"
																		></path>
																	</svg>
																</a>
															</div>
														</div>
													</div>

													<div className="divide-y divide-gray-200">
														{(location.pathname === "/orders" ||
															location.pathname === "/orders/") &&
															orders?.orders.map((order, index) => (
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

												<div className="overflow-hidden  border border-gray-200 rounded-xl lg:col-span-2">
													<OrderType />
													<SalesMonitor />
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
