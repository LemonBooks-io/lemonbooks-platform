/* eslint-disable no-mixed-spaces-and-tabs */
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";
import Button from "../../components/Button";
import { getRequest, postRequest } from "../../utils/fetch-function";
import PaymentOptionModal from "./PaymentOptionModal";
import axios from "axios";
import ClientServiceTable from "../client-customer-dashboard/ClientServiceTable";
import {
	CloseButton,
	Popover,
	PopoverBackdrop,
	PopoverButton,
	PopoverPanel,
} from "@headlessui/react";
import { PiArrowBendDownRight } from "react-icons/pi";
import Loader from "../../components/Loader";
import { calculateTotal } from "../../utils/helper-functions";

export default function CustomerDashboard() {
	const {
		handleLogout,
		userProfile,
		businessInfo,
		invoices,
		formatDate,
		BASE_URL,
		tenant,
		triggerUpdate,
		toast,
	} = useStates();

	const [processing, setProcessing] = useState(false);

	const [loading, setLoading] = useState(true);

	const [search] = useState("");

	const [selectedInvoices, setSelectedInvoices] = useState([]);
	const [paymentLinks, setPaymentLinks] = useState({ tap: null, custom: null });
	const [isOpen, setIsOpen] = useState(false);

	const type = "invoice";

	const fieldsToSearch = ["first_name", "last_name", "email", "number"];

	const filteredInvoices = invoices?.invoices
		?.filter((invoice) => invoice?.draft === (type === "estimate"))
		?.filter(
			(invoice) =>
				invoice?.status === "UNPAID" || invoice?.status === "REQUIRE_APPROVAL"
		)
		?.filter((value) =>
			fieldsToSearch.some((field) => {
				let fieldValue;

				if (field === "email") {
					fieldValue = value?.customer?.email;
				} else if (field === "number") {
					fieldValue = value?.customer?.phone?.number;
				} else if (field === "first_name") {
					fieldValue = value?.customer?.first_name;
				} else if (field === "last_name") {
					fieldValue = value?.customer?.last_name;
				}

				return fieldValue?.toLowerCase().includes(search.toLowerCase());
			})
		);

	const unpaidInvoices = filteredInvoices?.filter(
		(inv) => inv.status === "UNPAID"
	);

	const allSelected =
		unpaidInvoices?.length > 0 &&
		selectedInvoices.length === unpaidInvoices.length;

	const handleSelectAllInvoices = () => {
		const unpaidInvoiceIds = filteredInvoices
			?.filter((inv) => inv.status === "UNPAID")
			.map((inv) => inv.id);

		setSelectedInvoices(unpaidInvoiceIds);
	};

	const handleDeselectAllInvoices = () => {
		setSelectedInvoices([]);
	};

	const handleSelectInvoice = (id) => {
		setSelectedInvoices((prev) => (prev.includes(id) ? prev : [...prev, id]));
	};

	const handleDeselectInvoice = (id) => {
		setSelectedInvoices((prev) => prev.filter((num) => num !== id));
	};

	const navigate = useNavigate();

	async function handleMergeInvoice() {
		setProcessing(true);

		const response = await postRequest(
			"invoices/payment-links",
			{
				invoiceIds: selectedInvoices,
			},
			userProfile?.accessToken,
			""
		);

		if (response) {
			setPaymentLinks((pre) => ({
				...pre,
				tap: response?.data?.tapInvoiceUrl,
				custom: response?.data?.customInvoiceUrl,
			}));
		}

		setIsOpen(true);

		setProcessing(false);
	}

	function afterWaitProcessess() {
		setIsOpen(false);
		setProcessing(false);
		triggerUpdate();
		handleDeselectAllInvoices();
	}

	async function waitWhileInvoiceIsUnpaid(maxRetries = 6, delayMs = 10000) {
		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			setProcessing(true);
			const config = {
				headers: {
					"Content-Type": "application/json",
					"X-Tenant-ID": tenant,

					Accept: "application/json", // Include this if the server checks `Accept` headers
				},
			};

			const res = await axios.get(
				`${BASE_URL}/api/v2/invoices/${selectedInvoices?.at(0)}`,
				config
			);

			if (res?.data?.data?.status !== "UNPAID") {
				toast?.success("Payment has been received!");
				afterWaitProcessess();
				return;
			}

			if (attempt < maxRetries) {
				console.log(
					`Attempt ${attempt}: status is 'UNPAID', retrying in ${
						delayMs / 1000
					}s...`
				);
				await new Promise((resolve) => setTimeout(resolve, delayMs));
			} else {
				console.log(
					`Attempt ${attempt}: status still 'UNPAID', max retries reached, continuing anyway.`
				);
				afterWaitProcessess();
			}
		}
	}

	// All invoices from context
	const allInvoices = invoices?.invoices || [];

	// Helper to get total amount of invoices
	const getTotalAmount = (list) =>
		list?.reduce((acc, inv) => acc + (inv?.order?.amount || 0), 0);

	const now = new Date();
	const pastDueInvoices = allInvoices.filter(
		(inv) =>
			(inv.status === "UNPAID" || inv.status === "REQUIRE_APPROVAL") &&
			inv.due &&
			new Date(inv.due).getTime() < now.getTime()
	);

	const totalPastDue = getTotalAmount(pastDueInvoices);

	const subscriptionInvoices = allInvoices.filter((inv) =>
		inv?.description?.toLowerCase()?.includes("subscription")
	);

	const totalSubscription = getTotalAmount(subscriptionInvoices);

	const INVOICEMETRICS = [
		{
			title: "Total Past Due",
			value: totalPastDue.toFixed(3),
			noOfInvoices: pastDueInvoices.length,
		},
		{
			title: "Total Subscription",
			value: totalSubscription.toFixed(3),
			noOfInvoices: subscriptionInvoices.length,
		},
	];

	useEffect(() => {
		if (invoices?.invoices) {
			setLoading(false);
		}
	}, [invoices]);

	const [activeServices, setActiveServices] = useState([]);

	useEffect(() => {
		setLoading(true);
		async function fetchServices() {
			const res = await getRequest(
				`customer/subscriptions/${userProfile?.id}`,
				"",
				userProfile?.accessToken,
				tenant
			);

			setActiveServices(res?.data.filter((service) => !service.isCancelled));

			setLoading(false);
		}

		if (userProfile) {
			fetchServices();
		}
	}, [userProfile, tenant]);

	const hasUnpaidInvoices = filteredInvoices?.some(
		(invoice) => invoice?.status === "UNPAID"
	);

	return (
		<div className="flex flex-col min-h-screen">
			<PaymentOptionModal
				processing={processing}
				isOpen={isOpen}
				setIsOpen={setIsOpen}
				paymentLinks={paymentLinks}
				waitWhileInvoiceIsUnpaid={waitWhileInvoiceIsUnpaid}
				setProcessing={setProcessing}
			/>

			<header className="">
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
											to="/"
											className={({ isActive }) =>
												`inline-flex items-center px-2 py-2 text-sm ml-4 font-medium text-gray-600 
     transition-all duration-200 bg-white  hover:bg-gray-100 
     border-b-2 ${isActive ? "border-indigo-600" : "border-transparent"}`
											}
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
												/>
											</svg>
											Dashboard
										</NavLink>

										<NavLink
											to="/customer-estimates"
											title=""
											className={({ isActive }) =>
												`inline-flex items-center px-2 py-2 text-sm font-medium text-gray-600 
     transition-all duration-200 bg-white  hover:bg-gray-100 
     border-b-2 ${isActive ? "border-indigo-600" : "border-transparent"}`
											}
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
											Estimates
										</NavLink>

										<NavLink
											to="/customer-payments"
											title=""
											className={({ isActive }) =>
												`inline-flex items-center px-2 py-2 text-sm font-medium text-gray-600 
     transition-all duration-200 bg-white  hover:bg-gray-100 
     border-b-2 ${isActive ? "border-indigo-600" : "border-transparent"}`
											}
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
											Paid Invoices
										</NavLink>

										<NavLink
											to="/statement"
											title=""
											className={({ isActive }) =>
												`inline-flex items-center px-2 py-2 text-sm font-medium text-gray-600 
     transition-all duration-200 bg-white  hover:bg-gray-100 
     border-b-2 ${isActive ? "border-indigo-600" : "border-transparent"}`
											}
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
											Account Statement
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

				<div className="hidden py-3 bg-white border-b  border-gray-200 md:block">
					<div className="container px-4 mx-auto">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<NavLink
									to="/"
									className={({ isActive }) =>
										`inline-flex items-center px-2 py-2 text-sm font-medium text-gray-600 
     transition-all duration-200 bg-white  hover:bg-gray-100 
     border-b-2 ${isActive ? "border-indigo-600" : "border-transparent"}`
									}
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
										/>
									</svg>
									Dashboard
								</NavLink>

								<NavLink
									to="/customer-estimates"
									title=""
									className={({ isActive }) =>
										`inline-flex items-center px-2 py-2 text-sm font-medium text-gray-600 
     transition-all duration-200 bg-white  hover:bg-gray-100 
     border-b-2 ${isActive ? "border-indigo-600" : "border-transparent"}`
									}
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
									Estimates
								</NavLink>

								<NavLink
									to="/customer-payments"
									title=""
									className={({ isActive }) =>
										`inline-flex items-center px-2 py-2 text-sm font-medium text-gray-600 
     transition-all duration-200 bg-white  hover:bg-gray-100 
     border-b-2 ${isActive ? "border-indigo-600" : "border-transparent"}`
									}
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
									Paid Invoices
								</NavLink>

								<NavLink
									to="/statement"
									title=""
									className={({ isActive }) =>
										`inline-flex items-center px-2 py-2 text-sm font-medium text-gray-600 
     transition-all duration-200 bg-white  hover:bg-gray-100 
     border-b-2 ${isActive ? "border-indigo-600" : "border-transparent"}`
									}
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
									Account Statement
								</NavLink>
							</div>
						</div>
					</div>
				</div>
			</header>

			{loading ? (
				<Loader />
			) : (
				<div className="flex-1 overflow-x-hidden">
					<main>
						<div className="py-6">
							<div className=" mx-auto max-w-7xl">
								<div className="mb-[20px] px-4">
									<div>
										<p className="text-base font-bold text-gray-900">
											Hi {userProfile?.name} 👋
										</p>
										<p className="mt-1 text-sm font-medium text-gray-500">
											Here is the summary of your invoices, payment and
											subscriptions
										</p>
									</div>
								</div>

								<div className="grid gap-4 grid-cols-9 px-4">
									<div className="flex col-span-9 gap-4 overflow-scroll">
										{INVOICEMETRICS.map((metric, index) => (
											<div
												key={index}
												className="min-w-[262px] w-full flex justify-between border rounded-[8px] border-[#D1D5DB] p-4"
											>
												<div>
													<h4 className="text-sm font-normal text-[#6B7280] mb-1">
														{metric.title}
													</h4>
													<p className="text-[20px] font-bold mb-5 text-[#111827]">
														{metric.title === "Total Subscription"
															? Number(
																	activeServices.reduce(
																		(total, next) => total + (next.amount || 0),
																		0
																	)
															  ).toFixed(3)
															: Number(metric.value).toFixed(3)}{" "}
														KWD
													</p>

													<p className="text-sm text-gray-500 flex items-center gap-1">
														<PiArrowBendDownRight />
														{metric.title === "Total Subscription"
															? activeServices.length
															: metric.noOfInvoices}{" "}
														{metric?.title === "Total Estimates"
															? "Estimates"
															: metric?.title === "Total Past Due" ||
															  metric?.title === "Total Payment"
															? "Invoices"
															: "Subscriptions"}
													</p>
												</div>
											</div>
										))}
									</div>

									{filteredInvoices?.length === 0 ? null : (
										<div className="col-span-9">
											<div className="border border-gray-300 rounded-xl">
												<div className="px-4 pt-5 sm:px-6">
													<div className="flex items-center justify-between">
														<p className="text-base font-bold text-gray-900">
															Pending Payments
														</p>
														<div className="mt-4 sm:mt-0">
															<label className="sr-only"> Due Period </label>
															<select
																name=""
																id=""
																className="block w-full py-0 pl-0 pr-2 text-base border-none rounded-lg focus:outline-none focus:ring-0 sm:text-sm"
															>
																<option>Due in 7 days</option>
																<option>Due in 14 days</option>
															</select>
														</div>
													</div>
												</div>

												<div className="flex flex-col mt-4 h-full">
													<div className=" -my-2 overflow-x-auto h-full w-full">
														<div className="inline-block min-w-full py-2 align-middle h-full">
															<div className="overflow-hidden ring-black ring-opacity-5 md:rounded-xl h-full">
																{filteredInvoices?.length === 0 ? (
																	<div className="h-full w-full">
																		<table className="min-w-full bg-white lg:divide-y lg:divide-gray-200">
																			<thead className="hidden lg:table-header-group border-b">
																				<tr>
																					<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																						<div className="flex items-center">
																							INVOICE ID
																						</div>
																					</th>

																					<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																						<div className="flex items-center">
																							DUE DATE
																						</div>
																					</th>

																					<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																						<div className="flex items-center">
																							DESCRIPTION
																						</div>
																					</th>

																					<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																						<div className="flex items-center">
																							AMOUNT
																						</div>
																					</th>

																					{hasUnpaidInvoices && (
																						<th className="relative ">
																							<input
																								type="checkbox"
																								name="terms"
																								id="terms"
																								className="w-4 h-4  text-gray-600 border-gray-300 rounded focus:ring-0 ml-auto"
																								checked={allSelected}
																								onChange={
																									allSelected
																										? handleDeselectAllInvoices
																										: handleSelectAllInvoices
																								}
																							/>
																						</th>
																					)}
																				</tr>
																			</thead>
																		</table>

																		<div className="h-full w-full flex items-center justify-center">
																			No Data Available
																		</div>
																	</div>
																) : (
																	<table className="min-w-full bg-white lg:divide-y lg:divide-gray-200">
																		<thead className="hidden lg:table-header-group">
																			<tr>
																				<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																					<div className="flex items-center">
																						INVOICE ID
																					</div>
																				</th>

																				<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																					<div className="flex items-center">
																						DUE DATE
																					</div>
																				</th>

																				<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																					<div className="flex items-center">
																						DESCRIPTION
																					</div>
																				</th>

																				<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																					<div className="flex items-center">
																						AMOUNT
																					</div>
																				</th>

																				{hasUnpaidInvoices && (
																					<th className="relative ">
																						<input
																							type="checkbox"
																							name="terms"
																							id="terms"
																							className="w-4 h-4  text-gray-600 border-gray-300 rounded focus:ring-0 ml-auto"
																							checked={allSelected}
																							onChange={
																								allSelected
																									? handleDeselectAllInvoices
																									: handleSelectAllInvoices
																							}
																						/>
																					</th>
																				)}
																			</tr>
																		</thead>

																		<tbody className="divide-y divide-gray-200">
																			{filteredInvoices?.map((invoice) => (
																				<tr
																					onClick={() => {
																						navigate(
																							`./customer-invoices/${invoice?.invoiceNumber}`
																						);
																					}}
																					key={invoice?.invoiceNumber}
																					className="cursor-pointer hover:bg-gray-200  "
																				>
																					<td className="px-4  py-4 text-sm font-bold text-gray-900 sm:px-6 whitespace-nowrap">
																						<div> {invoice?.invoiceNumber}</div>
																						<div className="space-y-1 lg:hidden pl-4">
																							<p className="text-sm font-medium text-gray-500">
																								{formatDate(invoice?.due)}
																							</p>
																						</div>
																					</td>

																					<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																						{formatDate(invoice?.due)}
																					</td>

																					<td className="hidden px-4 py-4 text-sm  max-w-[50px]  text-gray-900 sm:px-6 lg:table-cell whitespace-normal break-words">
																						{invoice?.description}
																					</td>

																					<td className="hidden px-4 py-4 text-sm font-bold text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																						<div className="inline-flex items-center">
																							{calculateTotal(
																								invoice?.order?.items
																							).toFixed(3)}{" "}
																							{invoice?.order?.currency}
																						</div>
																					</td>

																					{invoice.status === "UNPAID" ? (
																						<td
																							onClick={(e) =>
																								e.stopPropagation()
																							}
																							className="hidden py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap"
																						>
																							<div className="flex items-center h-5">
																								<input
																									type="checkbox"
																									name="terms"
																									id="terms"
																									className="w-4 h-4  text-gray-600 border-gray-300 rounded focus:ring-0 mx-auto"
																									checked={selectedInvoices?.includes(
																										invoice?.id
																									)}
																									onChange={() => {
																										const isSelected =
																											selectedInvoices?.includes(
																												invoice?.id
																											);

																										if (isSelected) {
																											handleDeselectInvoice(
																												invoice.id
																											);
																										} else {
																											handleSelectInvoice(
																												invoice.id
																											);
																										}
																									}}
																								/>
																							</div>
																						</td>
																					) : (
																						<td className="hidden px-4 py-4 text-sm  text-gray-900 sm:px-6 lg:table-cell whitespace-normal break-words">
																							<div className="inline-flex items-center justify-end mt-1">
																								<svg
																									className={`mr-1.5 h-2.5 w-2.5 ${
																										invoice?.status ===
																											"UNPAID" &&
																										"text-gray-500"
																									}   ${
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
																								{invoice.paymentMethod ===
																								"UNSELECTED"
																									? null
																									: `(${invoice.paymentMethod})`}
																							</div>
																						</td>
																					)}

																					{invoice.status === "UNPAID" ? (
																						<td className="px-4 lg:hidden py-4 text-sm font-medium text-right text-gray-900 sm:px-6 whitespace-nowrap">
																							<div className=" py-4 text-sm font-bold text-gray-900  flex justify-end whitespace-nowrap">
																								{calculateTotal(
																									invoice?.order?.items
																								).toFixed(3)}{" "}
																								{invoice?.order?.currency}
																							</div>
																							<div className="mt-1 lg:hidden">
																								<div
																									onClick={(e) =>
																										e.stopPropagation()
																									}
																									className="inline-flex items-center justify-end mt-1"
																								>
																									<input
																										type="checkbox"
																										name="terms"
																										id="terms"
																										className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-0"
																										checked={selectedInvoices?.includes(
																											invoice?.id
																										)}
																										onClick={(e) =>
																											e.stopPropagation()
																										}
																										onChange={() => {
																											const isSelected =
																												selectedInvoices?.includes(
																													invoice?.id
																												);

																											if (isSelected) {
																												handleDeselectInvoice(
																													invoice.invoiceNumber
																												);
																											} else {
																												handleSelectInvoice(
																													invoice.invoiceNumber
																												);
																											}
																										}}
																									/>
																								</div>
																							</div>
																						</td>
																					) : (
																						<td className="lg:hidden px-4 py-4 text-sm  text-gray-900 sm:px-6 whitespace-normal break-words">
																							<div className="inline-flex items-center justify-end mt-1">
																								<svg
																									className={`mr-1.5 h-2.5 w-2.5 ${
																										invoice?.status ===
																											"UNPAID" &&
																										"text-gray-500"
																									}   ${
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
																								{invoice.paymentMethod ===
																								"UNSELECTED"
																									? null
																									: `(${invoice.paymentMethod})`}
																							</div>
																						</td>
																					)}
																				</tr>
																			))}
																		</tbody>
																	</table>
																)}
															</div>
														</div>
													</div>
												</div>
											</div>

											<div
												className={`w-full flex justify-end ${
													selectedInvoices?.length === 0 && "opacity-20 "
												}`}
											>
												{selectedInvoices?.length !== 0 && (
													<div className="flex w-full max-w-[250px] mt-2">
														<Button
															isLoading={processing}
															message="Processing..."
															disabled={selectedInvoices?.length === 0}
															onClick={handleMergeInvoice}
														>
															Make Payment
														</Button>
													</div>
												)}
											</div>
										</div>
									)}

									<div className="overflow-hidden flex flex-col gap-4 col-span-9">
										<ClientServiceTable activeServices={activeServices} />
									</div>
								</div>
							</div>
						</div>
					</main>
				</div>
			)}
		</div>
	);
}
