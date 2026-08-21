import { useState } from "react";

// import ChartDashboard from "./ChartDashboard";
import { NavLink } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";
import Button from "../../components/Button";
import { postRequest } from "../../utils/fetch-function";
import PaymentOptionModal from "./PaymentOptionModal";
import axios from "axios";

export default function CustomerDashboard() {
	const {
		handleLogout,
		userProfile,
		allClients,
		totalReceivables,
		businessInfo,
		invoices,
		formatDate,
		BASE_URL,
		tenant,
		triggerUpdate,
		toast,
	} = useStates();

	const [processing, setProcessing] = useState(false);

	const [search] = useState("");

	const [selectedInvoices, setSelectedInvoices] = useState([]);
	const [paymentLinks, setPaymentLinks] = useState({ tap: null, custom: null });
	// const [bulkInvoiceId, setBulk]
	const baseUrl = window.location.href;
	const [isOpen, setIsOpen] = useState(false);

	const type = "invoice";

	const fieldsToSearch = ["first_name", "last_name", "email", "number"];
	const filteredInvoices = invoices?.invoices
		?.filter((invoice) => invoice?.draft === (type === "estimate"))
		?.filter((invoice) => invoice?.status === "UNPAID")
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

	// console.log("customer invoices", filteredInvoices);

	const allSelected =
		filteredInvoices?.length > 0 &&
		selectedInvoices.length === filteredInvoices?.length;

	const handleSelectAllInvoices = () => {
		const allInvoiceNumbers = filteredInvoices?.map((inv) => inv.id);
		setSelectedInvoices(allInvoiceNumbers);
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

	// console.log("selected invoices are", selectedInvoices);

	async function handleMergeInvoice() {
		setProcessing(true);
		if (selectedInvoices?.length > 1) {
			const response = await postRequest(
				"invoices/bulk",
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
					custom: `${baseUrl}custom-payment?invoiceId=${response?.data?.invoiceId}`,
				}));
			}
		} else {
			const selectedInvoice = filteredInvoices?.find(
				(inv) => inv?.id === selectedInvoices.at(0)
			);

			setPaymentLinks((pre) => ({
				...pre,
				tap: selectedInvoice?.tapInvoiceUrl,
				custom: `${baseUrl}custom-payment?invoiceId=${selectedInvoices.at(0)}`,
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

			console.log("the invoice is", res?.data?.data);

			if (res?.data?.data?.status !== "UNPAID") {
				console.log(`Invoice paid on attempt ${attempt}, proceeding.`);
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

	return (
		<div className="flex flex-col">
			<PaymentOptionModal
				processing={processing}
				isOpen={isOpen}
				setIsOpen={setIsOpen}
				paymentLinks={paymentLinks}
				waitWhileInvoiceIsUnpaid={waitWhileInvoiceIsUnpaid}
			/>
			<header className="">
				<div className="py-3 bg-gray-900">
					<div className="container px-4 mx-auto">
						<div className="flex items-center justify-between ">
							<div className="block -m-2 lg:hidden">
								<button
									type="button"
									className="inline-flex items-center justify-center p-2 text-white bg-gray-900 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
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
											d="M4 6h16M4 12h16M4 18h16"
										></path>
									</svg>
								</button>
							</div>

							<div className="flex-shrink-0 ml-4 mr-4 lg:ml-0">
								<NavLink to="/" className="cursor-pointer flex ml-6 xl:ml-0">
									<div className="flex items-center gap-2 flex-shrink-0">
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

										<div className="hidden w-auto text-2xl text-gray-100 font-bold lg:block">
											LemonBooks
										</div>
									</div>
								</NavLink>
							</div>

							<div className="flex items-center ml-4 lg:ml-0">
								<button
									type="button"
									className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
									id="options-menu-button"
									aria-expanded="false"
									aria-haspopup="true"
								>
									<span className="flex items-center justify-between w-full">
										<span className="flex items-center justify-between min-w-0 space-x-3">
											<svg
												onClick={handleLogout}
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
													{businessInfo?.name}
												</span>
											</span>
										</span>
										<svg
											className="flex-shrink-0 w-4 h-4 ml-2 text-gray-400 group-hover:text-gray-500"
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
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="hidden py-3 bg-white border-b  border-gray-200 lg:block">
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
									{/* <svg
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
                  </svg> */}
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
									{/* <svg
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
                  </svg> */}
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
									Payment History
								</NavLink>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="flex-1 overflow-x-hidden">
				<main>
					<div className="py-6">
						<div className=" mx-auto max-w-7xl">
							<div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-9">
								<div className="overflow-hidden bg-white border border-gray-200 divide-y divide-gray-200 lg:col-span-3 rounded-xl">
									<div className="px-4 py-5 sm:p-6">
										<p className="text-base font-bold text-gray-900">
											Hi {userProfile?.name} 👋
										</p>
										<p className="mt-1 text-sm font-medium text-gray-500">
											Here's your business summary for the selected period
										</p>

										<div className="grid grid-cols-2 mt-6 xl:mt-12 gap-x-8">
											<div>
												<p className="text-[20px] font-bold text-gray-900">
													{allClients?.totalCount}
												</p>
												<p className="mt-1 text-sm text-gray-500 font-mediume">
													Unique Customers
												</p>
											</div>

											<div>
												<p className="text-[20px] font-bold text-gray-900">
													{totalReceivables?.total} KWD
												</p>
												<p className="mt-1 text-sm text-gray-500 font-mediume">
													Total Receivables
												</p>
											</div>
										</div>
									</div>

									<div className="px-4 py-4 sm:px-6">
										<div className="flex items-center">
											<svg
												className="mr-2 h-2.5 w-2.5 text-indigo-500 flex-shrink-0"
												fill="currentColor"
												viewBox="0 0 8 8"
											>
												<circle cx="4" cy="4" r="3"></circle>
											</svg>
											<p className="text-sm font-medium text-gray-900">
												<span className="font-bold">8 new payments</span> has
												been made
											</p>
										</div>
									</div>

									<div className="px-4 py-4 sm:px-6">
										<div className="flex items-center">
											<svg
												className="mr-2 h-2.5 w-2.5 text-indigo-500 flex-shrink-0"
												fill="currentColor"
												viewBox="0 0 8 8"
											>
												<circle cx="4" cy="4" r="3"></circle>
											</svg>
											<p className="text-sm font-medium text-gray-900">
												<span className="font-bold">7 new support</span> request
												received
											</p>
										</div>
									</div>
								</div>
								<div className="overflow-hidden bg-white border border-gray-200 lg:col-span-6 rounded-xl">
									<div className="px-4 pt-5 sm:px-6">
										<div className="flex items-center justify-between">
											<p className="text-base font-bold text-gray-900">
												Upcoming Payments
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

									<div className="flex flex-col mt-4">
										<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
											<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
												<div className="overflow-hidden ring-1 ring-black ring-opacity-5 md:rounded-xl">
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

																<th className="relative">
																	<input
																		type="checkbox"
																		name="terms"
																		id="terms"
																		className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-0"
																		checked={allSelected}
																		onChange={
																			allSelected
																				? handleDeselectAllInvoices
																				: handleSelectAllInvoices
																		}
																	/>
																</th>
															</tr>
														</thead>

														<tbody className="divide-y divide-gray-200">
															{filteredInvoices?.map((invoice) => (
																<tr
																	//   onClick={() => {
																	//     const selectedInvoice =
																	//       filteredInvoices.find(
																	//         (q) =>
																	//           q.invoiceNumber ===
																	//           invoice.invoiceNumber
																	//       );

																	//     if (selectedInvoice) {
																	//       setSelectedInvoice(selectedInvoice);
																	//       navigate(
																	//         `${path}/${selectedInvoice.invoiceNumber}`
																	//       );
																	//     }
																	//   }}
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

																	<td className="hidden px-4 py-4 text-sm  text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{/* {invoice?.order?.amount}{" "}
                                    {invoice?.order?.currency} */}
																		DESCRIPTION
																	</td>

																	<td className="hidden px-4 py-4 text-sm font-bold text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		<div className="inline-flex items-center">
																			{/* <svg
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
                                      </svg> */}
																			{invoice?.order?.amount}{" "}
																			{invoice?.order?.currency}
																		</div>
																	</td>

																	<td className="hidden  py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
																		{/* <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const selectedInvoice =
                                          filteredInvoices.find(
                                            (q) =>
                                              q.invoiceNumber ===
                                              invoice.invoiceNumber
                                          );
                                        navigator.clipboard.writeText(
                                          `Your invoice for the ordered products/services has been created.\n\nYou can follow the links below to pay:\nPay with card: ${selectedInvoice?.invoiceUrl}\nPay via transfer: https://lemonbooks.app/pay/transfer`
                                        );
                                        toast.success(
                                          "Payment instruction copied!"
                                        );
                                      }}
                                      className="text-gray-600 items-center flex  gap-1 hover:text-gray-700  font-semibold py-[2px] px-0  transition duration-200 "
                                    >
                                      <svg
                                        className="h-[18px]"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M20 2H10C8.897 2 8 2.897 8 4V8H4C2.897 8 2 8.897 2 10V20C2 21.103 2.897 22 4 22H14C15.103 22 16 21.103 16 20V16H20C21.103 16 22 15.103 22 14V4C22 2.897 21.103 2 20 2ZM4 20V10H14L14.002 20H4ZM20 14H16V10C16 8.897 15.103 8 14 8H10V4H20V14Z"
                                          fill="currentColor"
                                        />
                                      </svg>
                                    </button> */}

																		<div className="flex items-center h-5">
																			<input
																				type="checkbox"
																				name="terms"
																				id="terms"
																				className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-0"
																				checked={selectedInvoices?.includes(
																					invoice?.id
																				)}
																				onChange={() => {
																					const isSelected =
																						selectedInvoices?.includes(
																							invoice?.id
																						);

																					if (isSelected) {
																						handleDeselectInvoice(invoice.id);
																					} else {
																						handleSelectInvoice(invoice.id);
																					}
																				}}
																			/>
																		</div>
																	</td>

																	<td className="px-4 py-4 text-sm font-medium text-right text-gray-900 sm:px-6 whitespace-nowrap">
																		<div className="lg:hidden py-4 text-sm font-bold text-gray-900  flex justify-end whitespace-nowrap">
																			{invoice?.order?.amount}{" "}
																			{invoice?.order?.currency}
																		</div>
																		<div className="mt-1 lg:hidden">
																			<p>
																				{" "}
																				{invoice?.amount} {invoice?.currency}
																			</p>
																			<div className="inline-flex items-center justify-end mt-1">
																				<input
																					type="checkbox"
																					name="terms"
																					id="terms"
																					className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-0"
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
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>
										</div>
									</div>

									<div
										className={`p-2 h-16 w-full flex justify-end  ${
											selectedInvoices?.length === 0 && "opacity-20 "
										}`}
									>
										{selectedInvoices?.length !== 0 && (
											<div className="flex  w-full max-w-[250px]">
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

								<div className="overflow-hidden bg-white border border-gray-200 lg:col-span-3 rounded-xl">
									<div className="px-4 py-5 sm:p-6">
										<div className="sm:flex sm:items-center sm:justify-between">
											<p className="text-base font-bold text-gray-900">
												Sales Stats
											</p>

											<div className="mt-4 sm:mt-0">
												<div>
													<label className="sr-only"> Period </label>
													<select
														name=""
														id=""
														className="block w-full py-0 pl-0 pr-10 text-base border-none rounded-lg focus:outline-none focus:ring-0 sm:text-sm"
													>
														<option>Last 7 days</option>
														<option>Last month</option>
														<option>Last 24 hrs</option>
													</select>
												</div>
											</div>
										</div>

										<div className="mt-8 space-y-6">
											<div>
												<div className="flex items-center justify-between">
													<p className="text-sm font-medium text-gray-900">
														Direct
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
														Referral
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
														Social Media
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
														Twitter
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
									</div>
								</div>

								<div className="overflow-hidden bg-white border border-gray-200 lg:col-span-3 rounded-xl">
									<div className="px-4 py-5 sm:p-6">
										<p className="text-base font-bold text-gray-900">
											Activity
										</p>

										<div className="mt-6 space-y-6">
											<div className="flex items-center">
												<img
													className="flex-shrink-0 object-cover rounded-full w-9 h-9"
													src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/previews/dashboards/3/avatar-female.png"
													alt=""
												/>
												<div className="flex-1 min-w-0 ml-4">
													<p className="text-sm font-bold text-gray-900 truncate">
														Kristin Watson
													</p>
													<p className="mt-1 text-xs font-medium text-gray-500">
														Purchased{" "}
														<span className="text-indigo-600">
															{" "}
															Clarity Landing UI Kit{" "}
														</span>
													</p>
												</div>
											</div>

											<div className="flex items-center">
												<img
													className="flex-shrink-0 object-cover rounded-full w-9 h-9"
													src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/previews/dashboards/3/avatar-female-2.png"
													alt=""
												/>
												<div className="flex-1 min-w-0 ml-4">
													<p className="text-sm font-bold text-gray-900 truncate">
														Brooklyn Simmons
													</p>
													<p className="mt-1 text-xs font-medium text-gray-500">
														Purchased{" "}
														<span className="text-indigo-600">
															{" "}
															Clarity Ecommerce UI Kit{" "}
														</span>
													</p>
												</div>
											</div>

											<div className="flex items-center">
												<img
													className="flex-shrink-0 object-cover rounded-full w-9 h-9"
													src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/previews/dashboards/3/avatar-male.png"
													alt=""
												/>
												<div className="flex-1 min-w-0 ml-4">
													<p className="text-sm font-bold text-gray-900 truncate">
														Darrell Steward
													</p>
													<p className="mt-1 text-xs font-medium text-gray-500">
														Purchased{" "}
														<span className="text-indigo-600">
															{" "}
															Clarity Ecommerce UI Kit{" "}
														</span>
													</p>
												</div>
											</div>

											<div className="flex items-center">
												<img
													className="flex-shrink-0 object-cover rounded-full w-9 h-9"
													src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/previews/dashboards/3/avatar-female-3.png"
													alt=""
												/>
												<div className="flex-1 min-w-0 ml-4">
													<p className="text-sm font-bold text-gray-900 truncate">
														Ronald Richards
													</p>
													<p className="mt-1 text-xs font-medium text-gray-500">
														Purchased{" "}
														<span className="text-indigo-600">
															{" "}
															Clarity Landing UI Kit{" "}
														</span>
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className="overflow-hidden bg-white border border-gray-200 lg:col-span-3 rounded-xl">
									<div className="px-4 py-5 sm:p-6">
										<p className="text-base font-bold text-gray-900">
											Insights
										</p>

										<div className="mt-6 space-y-3">
											<div className="bg-gray-100 rounded-lg">
												<div className="px-3 py-3">
													<div className="flex items-center">
														<svg
															className="flex-shrink-0 w-5 h-5 mr-2 text-indigo-600"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
															strokeWidth="2"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
														<p className="text-sm font-medium text-gray-900">
															<span className="font-bold">39%</span> of your
															visitors are coming from Twitter
														</p>
													</div>
												</div>
											</div>

											<div className="bg-gray-100 rounded-lg">
												<div className="px-3 py-3">
													<div className="flex items-center">
														<svg
															className="flex-shrink-0 w-5 h-5 mr-2 text-indigo-600"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
															strokeWidth="2"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
														<p className="text-sm font-medium text-gray-900">
															Current MRR is the{" "}
															<span className="font-bold">highest</span> in last
															12 months
														</p>
													</div>
												</div>
											</div>

											<div className="bg-gray-100 rounded-lg">
												<div className="px-3 py-3">
													<div className="flex items-center">
														<svg
															className="flex-shrink-0 w-5 h-5 mr-2 text-indigo-600"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
															strokeWidth="2"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
														<p className="text-sm font-medium text-gray-900">
															Your highest growth in a day is{" "}
															<span className="font-bold">14 customers</span>
														</p>
													</div>
												</div>
											</div>

											<div className="bg-gray-100 rounded-lg">
												<div className="px-3 py-3">
													<div className="flex items-center">
														<svg
															className="flex-shrink-0 w-5 h-5 mr-2 text-indigo-600"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
															strokeWidth="2"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
														<p className="text-sm font-medium text-gray-900">
															Your bounce rate is{" "}
															<span className="font-bold">54%</span> now
														</p>
													</div>
												</div>
											</div>
										</div>

										<div className="mt-5 text-right">
											<a
												href="#"
												title=""
												className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-gray-900"
											>
												View all insights
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
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
