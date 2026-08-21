/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import LoadingModal from "../loading/LoadingModal";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { calculateTotal } from "../../utils/helper-functions";

export default function PaymentsDashboard({ type }) {
	const { setPaymentsData, formatDate, invoices, setSelectedInvoice } =
		useStates();

	const [search, setSearch] = useState("");
	const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");

	const fieldsToSearch = useMemo(() => {
		return ["first_name", "last_name", "email", "number", "invoiceNumber"];
	}, []);

	const filteredInvoices = useMemo(() => {
		if (!invoices?.invoices) return [];

		return invoices.invoices
			.filter((invoice) => invoice?.draft === (type === "estimate"))
			.filter((invoice) => {
				if (paymentStatusFilter === "ALL") {
					return (
						invoice?.status === "REQUIRE_APPROVAL" || invoice?.status === "PAID"
					);
				}
				return invoice?.status === paymentStatusFilter;
			})
			.filter((value) =>
				fieldsToSearch.some((field) => {
					let fieldValue;

					switch (field) {
						case "email":
							fieldValue = value?.customer?.email;
							break;
						case "number":
							fieldValue = value?.customer?.phone?.number;
							break;
						case "first_name":
							fieldValue = value?.customer?.first_name;
							break;
						case "last_name":
							fieldValue = value?.customer?.last_name;
							break;
						case "invoiceNumber":
							fieldValue = value?.invoiceNumber.toLowerCase();
							break;
					}

					return fieldValue
						?.toString()
						.toLowerCase()
						.includes(search.toLowerCase());
				})
			);
	}, [invoices, type, paymentStatusFilter, search, fieldsToSearch]);

	useEffect(() => {
		setPaymentsData(filteredInvoices); // only when base filters change
	}, [filteredInvoices, setPaymentsData]);

	const handleChange = (e) => {
		const value = e.target.value;
		const statusMap = {
			"All Payments": "ALL",
			"Confirmed Payments": "PAID",
			"Require Approval": "REQUIRE_APPROVAL",
		};

		setPaymentStatusFilter(statusMap[value] || "ALL");
	};

	const navigate = useNavigate();
	const path = useLocation().pathname;

	return (
		<>
			<LoadingModal />
			{location.pathname === "/payments" ||
			location.pathname === "/payments/" ? (
				<div className="py-6">
					<div className="px-4 mx-auto mt-8 sm:px-6 md:px-8 ">
						<div className="space-y-5 sm:space-y-6">
							<div className="lg:col-span-9">
								<div className="flex items-center justify-between flex-wrap gap-4">
									<p className="text-base font-bold text-gray-900">
										{type === "estimate" && "ESTIMATES"}
										{type === "invoice" && "PAYMENTS"}
									</p>

									<div className="flex order-3 w-full sm:max-w-xs">
										<label className="sr-only"> Search </label>
										<div className="relative w-full">
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
												onChange={(e) => setSearch(e.target.value)}
												className="block  w-full py-2 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
												placeholder="Type to search"
											/>
										</div>
									</div>

									<select
										onChange={handleChange}
										id="sort"
										name="sort"
										className="block  w-fit py-2 pl-1  text-base bg-transparent border-gray-300 border-none rounded-lg focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
									>
										<option>All Payments</option>
										<option>Confirmed Payments </option>
										<option>Require Approval</option>
									</select>
								</div>

								<div className="flex flex-col mt-4">
									<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
										<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
											<div className="overflow-hidden ring-1 ring-black ring-opacity-5 md:rounded-xl">
												<table className="min-w-full bg-white lg:divide-y lg:divide-gray-200">
													<thead className="hidden lg:table-header-group">
														<tr>
															<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																<div className="flex items-center">NAME</div>
															</th>

															<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																<div className="flex items-center">
																	INVOICE NO
																</div>
															</th>

															<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																<div className="flex items-center">
																	PAYMENT DATE
																</div>
															</th>

															<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																<div className="flex items-center">AMOUNT</div>
															</th>

															<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																<div className="flex items-center">STATUS</div>
															</th>

															<th className="relative py-3.5 pl-3 pr-4 sm:pr-6 md:pr-0">
																<span className="sr-only"> Actions </span>
															</th>
														</tr>
													</thead>

													<tbody className="divide-y divide-gray-200">
														{filteredInvoices?.map((invoice) => (
															<tr
																onClick={() => {
																	const selectedInvoice = filteredInvoices.find(
																		(q) =>
																			q.invoiceNumber === invoice.invoiceNumber
																	);

																	if (selectedInvoice) {
																		setSelectedInvoice(selectedInvoice);
																		navigate(
																			`${path}/${selectedInvoice.invoiceNumber}`
																		);
																	}
																}}
																key={invoice?.invoiceNumber}
																className="cursor-pointer hover:bg-gray-200  "
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
																			{invoice?.invoiceNumber}
																		</p>
																		<p className="text-sm font-medium text-gray-500">
																			{formatDate(invoice?.updatedAt)}
																		</p>
																	</div>
																</td>
																<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																	{invoice?.invoiceNumber}
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
																				invoice?.status === "PAID" &&
																				"text-green-500"
																			} ${
																				invoice?.status ===
																					"REQUIRE_APPROVAL" &&
																				"text-orange-500"
																			}`}
																			fill="currentColor"
																			viewBox="0 0 8 8"
																		>
																			<circle cx="4" cy="4" r="3" />
																		</svg>
																		{type === "invoice" &&
																			invoice?.status?.replace(/_/g, " ")}
																		{type === "estimate" &&
																			invoice?.status?.replace(/_/g, " ")}{" "}
																		({invoice?.paymentMethod})
																	</div>
																</td>

																<td className="px-4 py-4 text-sm lg:hidden font-medium text-right text-gray-900 sm:px-6 whitespace-nowrap">
																	<div className="lg:hidden py-4 text-sm font-bold text-gray-900  flex justify-end whitespace-nowrap">
																		{calculateTotal(
																			invoice?.order?.items
																		).toFixed(3)}{" "}
																		{invoice?.order?.currency}
																	</div>
																	<div className="mt-1 lg:hidden">
																		<div className="inline-flex items-center justify-end mt-1">
																			<svg
																				className={`mr-1.5 h-2.5 w-2.5 ${
																					invoice?.status === "PAID" &&
																					"text-green-500"
																				} ${
																					invoice?.status ===
																						"REQUIRE_APPROVAL" &&
																					"text-orange-500"
																				} `}
																				fill="currentColor"
																				viewBox="0 0 8 8"
																			>
																				<circle cx="4" cy="4" r="3" />
																			</svg>
																			{type === "invoice" &&
																				invoice?.status?.replace(/_/g, " ")}
																			{type === "estimate" &&
																				invoice?.status?.replace(
																					/_/g,
																					" "
																				)}{" "}
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
			) : (
				<Outlet />
			)}
		</>
	);
}
