import { useEffect, useMemo, useState } from "react";

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";
import {
	CloseButton,
	Popover,
	PopoverBackdrop,
	PopoverButton,
	PopoverPanel,
} from "@headlessui/react";
import { PiArrowBendDownRight } from "react-icons/pi";
import { differenceInDays, differenceInHours } from "date-fns";
import ReactApexChart from "react-apexcharts";
import Loader from "../../components/Loader";
import { calculateTotal } from "../../utils/helper-functions";

export default function Dashboard() {
	const [chart5Options] = useState({
		chart: {
			type: "bar",
			height: 1000,
			toolbar: {
				show: false,
			},
		},
		width: "10%",
		height: "100%",
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
					return val.toFixed(0);
				},
			},
		},
		fill: {
			opacity: 1,
		},
		colors: ["#4F46E5", "#E4E4E7"],
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
	});

	const [series] = useState([
		{
			name: "Total Sales",
			data: [44, 55, 77, 87, 61, 58, 35],
		},
		{
			name: "Order Count",
			data: [30, 45, 65, 70, 50, 40, 25],
		},
	]);

	const {
		handleLogout,
		userProfile,
		allClients,
		totalReceivables,
		businessInfo,
		invoices,
		formatDate,
		setSelectedInvoice,
	} = useStates();

	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);

	const type = "invoice";

	const filteredPayments = useMemo(() => {
		if (!invoices?.invoices) return [];

		return invoices.invoices
			.filter((invoice) => invoice?.draft === false)
			.filter((invoice) => {
				return (
					invoice?.status === "REQUIRE_APPROVAL" || invoice?.status === "PAID"
				);
			});
	}, [invoices]);

	console.log({ filteredPayments });

	const INVOICEMETRICS = useMemo(() => {
		if (!invoices?.invoices) return [];

		const now = new Date();

		// Filter overdue invoices
		const overdueInvoices = invoices.invoices.filter(
			(inv) => inv?.due && new Date(inv.due) < now && inv.status === "UNPAID"
		);

		// Helper to sum amounts
		const totalAmount = (list) =>
			list.reduce((acc, inv) => acc + (Number(inv?.order?.amount) || 0), 0);

		// Group cumulatively
		const oneWeek = overdueInvoices.filter(
			(inv) => differenceInDays(now, new Date(inv.due)) > 7
		);

		const twoWeeks = overdueInvoices.filter(
			(inv) => differenceInDays(now, new Date(inv.due)) > 14
		);

		const oneMonth = overdueInvoices.filter(
			(inv) => differenceInDays(now, new Date(inv.due)) > 30
		);

		return [
			{
				title: "Total Past Due",
				value: totalAmount(oneMonth).toLocaleString(),
				duration: "1 month",
				noOfInvoices: oneMonth.length,
			},
			{
				title: "Total Past Due",
				value: totalAmount(twoWeeks).toLocaleString(),
				duration: "2 weeks",
				noOfInvoices: twoWeeks.length,
			},
			{
				title: "Total Past Due",
				value: totalAmount(oneWeek).toLocaleString(),
				duration: "1 week",
				noOfInvoices: oneWeek.length,
			},
		];
	}, [invoices]);

	useEffect(() => {
		if (invoices?.invoices && allClients && totalReceivables) {
			setLoading(false);
		}
	}, [invoices, allClients, totalReceivables]);

	const last48HrPayments = invoices?.invoices?.filter((inv) => {
		if (inv?.status !== "PAID" && inv?.status !== "REQUIRE_APPROVAL")
			return false;

		const updatedAt = new Date(inv?.updatedAt);
		const now = new Date();

		const hoursAgo = differenceInHours(now, updatedAt);
		return hoursAgo <= 48;
	});

	const last48HrPaymentCount = last48HrPayments?.length || 0;

	return (
		<div className="flex flex-col min-h-screen">
			<header>
				<div className="py-3 bg-gray-900">
					<div className="container px-4 mx-auto">
						<div className="flex items-center justify-between">
							<Popover className="block md:hidden group">
								<PopoverButton className="inline-flex items-center justify-center p-2 text-white bg-gray-900 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 data-active:text-white data-focus:outline data-focus:outline-white data-hover:text-white">
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
											d="M4 6h16M4 12h16M4 18h16"
										></path>
									</svg>
								</PopoverButton>
								<PopoverBackdrop
									transition
									className="fixed inset-0 bg-black/80 transition duration-100 z-10 ease-out"
								/>
								<PopoverPanel
									transition
									className="fixed pr-4 pt-4 top-0 bottom-0 transition left-0 duration-200 ease-in z-20 w-full [@media(min-width:400px)]:w-1/2 bg-white"
								>
									<div className="relative">
										<CloseButton className="absolute right-0 inline-flex items-center justify-center p-2 text-white bg-gray-900 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 data-active:text-white data-focus:outline data-focus:outline-white data-hover:text-white">
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
													strokeWidth="2"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</CloseButton>
									</div>

									<div className="flex pt-[64px] items-start justify-start gap-4 flex-col space-x-4">
										<NavLink
											to="/payments"
											title=""
											className="inline-flex items-center ml-4 px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
										>
											<svg
												className="w-6 h-6 mr-2 -ml-1 text-gray-400"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth="2"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
												></path>
											</svg>
											Payments
										</NavLink>

										<NavLink
											to="/invoices"
											title=""
											className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
										>
											<svg
												className="w-6 h-6 mr-2 -ml-1 text-gray-400"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth="2"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
												></path>
											</svg>
											Invoices
										</NavLink>

										<NavLink
											to="/estimates"
											title=""
											className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
										>
											<svg
												className="w-6 h-6 mr-2 -ml-1 text-gray-400"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth="2"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
												></path>
											</svg>
											Estimates
										</NavLink>

										<NavLink
											to="/clients"
											className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
										>
											<svg
												className="w-6 h-6 mr-2 -ml-1 text-gray-400"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth="2"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
												></path>
											</svg>
											Customers
										</NavLink>

										<NavLink
											to="/users"
											title=""
											className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
										>
											<svg
												className="w-6 h-6 mr-2 -ml-1 text-gray-400"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth="2"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
												></path>
											</svg>
											Users
											<svg
												className="w-5 h-5 ml-1"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth="2"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M19 9l-7 7-7-7"
												></path>
											</svg>
										</NavLink>
									</div>
								</PopoverPanel>
							</Popover>

							<div className="flex-shrink-0 ml-4 mr-4 lg:ml-0">
								<NavLink to="/" className="cursor-pointer flex ml-6 xl:ml-0">
									<div className="flex items-center gap-2 flex-shrink-0">
										{businessInfo?.logoUrl ? (
											<img
												src={businessInfo?.logoUrl}
												alt="Business Logo"
												className="block w-auto h-7"
											/>
										) : (
											<svg
												className="block w-auto h-7 "
												viewBox="0 0 80 80"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M68.0543 1.67383H11.9874C6.29189 1.67383 1.6748 6.29092 1.6748 11.9864V68.0534C1.6748 73.7488 6.29189 78.3659 11.9874 78.3659H68.0543C73.7498 78.3659 78.3669 73.7488 78.3669 68.0534V11.9864C78.3669 6.29092 73.7498 1.67383 68.0543 1.67383Z"
													fill="#2563EB"
												/>
												<path
													d="M26.1288 26.252H13.3455C11.7405 26.252 10.4395 27.553 10.4395 29.158V66.2929C10.4395 67.8979 11.7405 69.1989 13.3455 69.1989H26.1288C27.7337 69.1989 29.0348 67.8979 29.0348 66.2929V29.158C29.0348 27.553 27.7337 26.252 26.1288 26.252Z"
													fill="white"
												/>
												<path
													d="M47.9484 50.0547H35.7983C34.2728 50.0547 33.0361 51.0171 33.0361 52.2044V67.0678C33.0361 68.255 34.2728 69.2175 35.7983 69.2175H47.9484C49.4739 69.2175 50.7106 68.255 50.7106 67.0678V52.2044C50.7106 51.0171 49.4739 50.0547 47.9484 50.0547Z"
													fill="white"
												/>
												<path
													d="M72.5784 26.2521C72.5784 29.8581 71.5091 33.3832 69.5057 36.3816C67.5022 39.3799 64.6547 41.7168 61.3231 43.0968C57.9916 44.4768 54.3256 44.8378 50.7888 44.1343C47.2521 43.4308 44.0033 41.6943 41.4535 39.1445C38.9036 36.5946 37.1671 33.3459 36.4636 29.8091C35.7601 26.2723 36.1212 22.6064 37.5012 19.2748C38.8811 15.9432 41.218 13.0957 44.2164 11.0923C47.2147 9.08885 50.7398 8.01953 54.3458 8.01953L54.3458 26.2521H72.5784Z"
													fill="white"
												/>
											</svg>
										)}

										<div className="hidden w-auto text-2xl text-gray-100 font-bold md:block">
											{businessInfo?.name ? businessInfo?.name : "LemonBooks"}
										</div>
									</div>
								</NavLink>
							</div>

							<div className="flex items-center ml-4 lg:ml-0">
								<button
									onClick={handleLogout}
									type="button"
									className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
									id="options-menu-button"
									aria-expanded="false"
									aria-haspopup="true"
								>
									<span className="flex items-center justify-between w-full">
										<span className="flex items-center justify-between min-w-0 space-x-3">
											<svg
												className="flex-shrink-0 cursor-pointer object-cover text-red-600  rounded-full w-7 h-7"
												viewBox="0 0 24 24"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M12 10C13.1 10 14 9.1 14 8V4C14 2.9 13.1 2 12 2C10.9 2 10 2.9 10 4V8C10 9.1 10.9 10 12 10Z"
													fill="currentColor"
												/>
												<path
													d="M19.1 4.9C18.8 4.6 18.5 4.5 18 4.5C17.2 4.5 16.5 5.2 16.5 6C16.5 6.4 16.7 6.8 16.9 7.1C18.2 8.4 18.9 10.1 18.9 12C18.9 15.9 15.8 19 11.9 19C8 19 4.9 15.9 4.9 12C4.9 10.1 5.7 8.3 7 7.1C7.3 6.8 7.5 6.4 7.5 6C7.5 5.2 6.8 4.5 6 4.5C5.6 4.5 5.2 4.7 4.9 4.9C3.1 6.7 2 9.2 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 9.2 20.9 6.7 19.1 4.9Z"
													fill="currentColor"
												/>
											</svg>

											<span className="flex-1 hidden min-w-0 md:flex">
												<span className="text-sm font-medium text-white truncate">
													{" "}
													{userProfile?.name}
												</span>
											</span>
										</span>
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="hidden container mx-auto px-4 py-3 bg-white border-b border-gray-200 md:block">
					<div className="container px-4 mx-auto">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<NavLink
									to="/payments"
									title=""
									className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
								>
									<svg
										className="w-6 h-6 mr-2 -ml-1 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
										></path>
									</svg>
									Payments
								</NavLink>
								<NavLink
									to="/invoices"
									title=""
									className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
								>
									<svg
										className="w-6 h-6 mr-2 -ml-1 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
										></path>
									</svg>
									Invoices
								</NavLink>

								<NavLink
									to="/estimates"
									title=""
									className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
								>
									<svg
										className="w-6 h-6 mr-2 -ml-1 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
										></path>
									</svg>
									Estimates
								</NavLink>

								<NavLink
									to="/clients"
									className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
								>
									<svg
										className="w-6 h-6 mr-2 -ml-1 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
										></path>
									</svg>
									Customers
								</NavLink>

								<NavLink
									to="/users"
									title=""
									className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
								>
									<svg
										className="w-6 h-6 mr-2 -ml-1 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
										></path>
									</svg>
									Users
									<svg
										className="w-5 h-5 ml-1"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M19 9l-7 7-7-7"
										></path>
									</svg>
								</NavLink>
							</div>
						</div>
					</div>
				</div>
			</header>

			{loading ? (
				<Loader />
			) : (
				<>
					<div className="flex-1 overflow-x-hidden">
						<main>
							<div className="py-6">
								<div className="mx-auto max-w-7xl">
									<div className="flex mb-[20px] flex-wrap gap-4 items-end justify-between px-4">
										<div>
											<p className="text-base font-bold text-gray-900">
												Hi {userProfile?.name} 👋
											</p>
											<p className="mt-1 text-sm font-medium text-gray-500">
												Take a look at the summary of your business activities
												and performance
											</p>
										</div>

										<a
											href="invoices/create"
											className="text-[#4F46E5] font-medium"
										>
											+ Create New Invoice
										</a>
									</div>

									<div className="grid grid-cols-1 gap-4 lg:grid-cols-9 px-4 relative">
										<div className="overflow-hidden gap-4 flex flex-col lg:col-span-3">
											<div className="border mt-[150px] lg:mt-0 border-gray-300 rounded-xl p-6 space-y-5">
												<div>
													<div className="grid grid-cols-2 gap-x-8">
														<div>
															<p className="text-[20px] font-bold text-gray-900">
																{allClients?.totalCount}
															</p>
															<p className="mt-1 text-sm text-gray-500 font-medium">
																Unique Customers
															</p>
														</div>

														<div>
															<p className="text-[20px] font-bold text-gray-900">
																{Number(totalReceivables?.total).toFixed(3)} KWD
															</p>
															<p className="mt-1 text-sm text-gray-500 font-medium">
																Total Receivables
															</p>
														</div>
													</div>
												</div>
												<div className="bg-[#F6F6FF] p-4 rounded-[8px] space-y-2">
													<div>
														<div className="flex items-center">
															<svg
																className="mr-2 h-2.5 w-2.5 text-indigo-500 flex-shrink-0"
																fill="currentColor"
																viewBox="0 0 8 8"
															>
																<circle cx="4" cy="4" r="3"></circle>
															</svg>
															<p className="text-sm font-medium text-gray-900">
																<span className="font-bold">
																	{last48HrPaymentCount} new payments
																</span>{" "}
																has been made
															</p>
														</div>
													</div>
												</div>
											</div>

											<div className="border border-gray-300 rounded-xl h-full">
												<ReactApexChart
													options={chart5Options}
													series={series}
													type="bar"
												/>
											</div>
										</div>

										<div className="overflow-hidden bg-white  lg:col-span-6 flex flex-col">
											<div className="flex absolute lg:relative lg:right-0 lg:left-0 top-0 left-4 right-4 gap-4 overflow-scroll">
												{INVOICEMETRICS.map((metric, index) => (
													<div
														key={index}
														onClick={() =>
															navigate(
																`/invoices?filter=${metric.duration
																	.replace(" ", "")
																	.toLowerCase()}`
															)
														}
														className="min-w-[262px] w-full flex justify-between border rounded-[8px] border-[#D1D5DB] p-4 cursor-pointer hover:shadow-md hover:border-indigo-400 transition"
													>
														<div>
															<h4 className="text-sm font-normal text-[#6B7280] mb-1">
																{metric.title}
															</h4>
															<p className="text-[20px] font-bold mb-5 text-[#111827]">
																{metric.value} KWD
															</p>
															<p className="text-sm text-gray-500 flex items-center gap-1">
																<PiArrowBendDownRight />
																{metric.noOfInvoices} Invoices
															</p>
														</div>

														<p
															className={`text-sm self-start font-medium py-[6px] px-3 rounded-[208px] ${
																metric.duration === "1 month"
																	? "bg-[#FEE8ED] text-[#F80C43]"
																	: metric.duration === "2 weeks"
																	? "bg-[#FFEFE5] text-[#FB6101]"
																	: "bg-[#FFE2F9] text-[#D300A7]"
															}`}
														>
															{metric.duration}
														</p>
													</div>
												))}
											</div>

											<div className="border flex-1 border-gray-300 z-50 relative rounded-xl mt-6">
												<div className="px-4 py-5 sm:p-6">
													<div className="sm:flex sm:items-start sm:justify-between">
														<div>
															<p className="text-base font-bold text-gray-900">
																Recent Payments
															</p>
														</div>

														<div className="mt-4 sm:mt-0">
															<Link
																to="/payments"
																className="inline-flex items-center text-xs font-semibold tracking-widest text-gray-500 uppercase hover:text-gray-900"
															>
																See all Payment
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
															</Link>
														</div>
													</div>
												</div>

												<div className="-mx-4 -my-2 overflow-x-auto h-full sm:-mx-6 lg:-mx-8 ">
													<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
														<div className="overflow-hidden ring-1 ring-black z-10 relative ring-opacity-5 md:rounded-xl">
															<table className="min-w-full ">
																<thead className="hidden lg:table-header-group border-b ">
																	<tr className="">
																		<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																			<div className="flex items-center">
																				NAME
																			</div>
																		</th>

																		<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																			<div className="flex items-center">
																				PHONE
																			</div>
																		</th>

																		<th className="py-3.5 px-4 text-left  sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																			<div className="flex items-center">
																				PAYMENT DATE
																			</div>
																		</th>

																		<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																			<div className="flex items-center">
																				AMOUNT
																			</div>
																		</th>

																		<th className="py-3.5 px-4 text-left  sm:px-6  text-sm whitespace-nowrap font-medium text-gray-500">
																			<div className="flex items-center ">
																				STATUS
																			</div>
																		</th>
																	</tr>
																</thead>

																<tbody className="divide-y divide-gray-200">
																	{filteredPayments
																		?.slice(0, 4)
																		?.map((invoice) => (
																			<tr
																				onClick={() => {
																					const selectedInvoice =
																						filteredPayments.find(
																							(q) =>
																								q.invoiceNumber ===
																								invoice.invoiceNumber
																						);

																					if (selectedInvoice) {
																						setSelectedInvoice(selectedInvoice);
																						navigate(
																							`/payments/${selectedInvoice.invoiceNumber}`
																						);
																					}
																				}}
																				key={invoice?.invoiceNumber}
																				className="cursor-pointer hover:bg-gray-200"
																			>
																				<td className="px-4  py-4 text-sm font-bold text-gray-900 sm:px-6 whitespace-nowrap">
																					<div className="inline-flex items-center">
																						{invoice?.customer?.company ||
																							invoice?.customer?.first_name +
																								" " +
																								invoice?.customer?.last_name}
																					</div>
																					<div className="space-y-1 lg:hidden pl-4">
																						<p className="text-sm font-medium text-gray-500">
																							{formatDate(invoice?.updatedAt)}
																						</p>
																					</div>
																				</td>

																				<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																					{
																						invoice?.customer?.phone
																							?.country_code
																					}{" "}
																					{invoice?.customer?.phone?.number}
																				</td>

																				<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																					{formatDate(invoice?.updatedAt)}
																				</td>

																				<td className="hidden px-4 py-4 text-sm font-bold text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																					{calculateTotal(
																						invoice?.order?.items
																					).toFixed(3)}{" "}
																					{invoice?.order?.currency}
																				</td>

																				<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																					<div className="inline-flex items-center">
																						<svg
																							className={` mr-1.5 h-2.5 w-2.5 ${
																								invoice?.status === "UNPAID" &&
																								"text-gray-500"
																							}
                                        ${
																					invoice?.status === "PAID" &&
																					"text-green-500"
																				}
                                        ${
																					invoice?.status ===
																						"REQUIRE_APPROVAL" &&
																					"text-orange-300"
																				}`}
																							fill="currentColor"
																							viewBox="0 0 8 8"
																						>
																							<circle cx="4" cy="4" r="3" />
																						</svg>
																						{type === "invoice" &&
																							invoice?.status?.replace(
																								/_/g,
																								" "
																							)}
																						{type === "estimate" &&
																							invoice?.status}{" "}
																						({invoice?.paymentMethod})
																					</div>
																				</td>

																				<td className=" lg:hidden px-4 py-4 text-sm font-medium text-right text-gray-900 sm:px-6 whitespace-nowrap">
																					<div className="lg:hidden py-4 text-sm font-bold text-gray-900  flex justify-end whitespace-nowrap">
																						{Number(
																							invoice?.order?.amount
																						).toFixed(3)}{" "}
																						{invoice?.order?.currency}
																					</div>
																					<div className="mt-1 lg:hidden">
																						<div className="inline-flex items-center justify-end mt-1">
																							<svg
																								className={`mr-1.5 h-2.5 w-2.5 

                                          ${
																						invoice?.status === "UNPAID" &&
																						"text-gray-500"
																					}
                                          ${
																						invoice?.status === "PAID" &&
																						"text-green-500"
																					}
                                          ${
																						invoice?.status ===
																							"REQUIRE_APPROVAL" &&
																						"text-orange-300"
																					}
                                          
                                          `}
																								fill="currentColor"
																								viewBox="0 0 8 8"
																							>
																								<circle cx="4" cy="4" r="3" />
																							</svg>
																							{type === "invoice" &&
																								invoice?.status?.replace(
																									/_/g,
																									" "
																								)}
																							{type === "estimate" &&
																								invoice?.status}{" "}
																							({invoice?.paymentMethod})
																						</div>
																					</div>
																				</td>
																			</tr>
																		))}
																</tbody>
															</table>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</main>
					</div>
				</>
			)}
		</div>
	);
}
