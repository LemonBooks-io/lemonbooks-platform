import axios from "axios";
import React, { useEffect, useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import LoadingModal from "../loading/LoadingModal";
import { getRequest } from "../../utils/fetch-function";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import TemplateMenu from "./TemplateMenu";

export default function BusinessesDashboard({ type }) {
	const { formatDateTime, formatDate, invoices, setSelectedInvoice, toast } =
		useStates();

	const [search, setSearch] = useState("");

	const fieldsToSearch = ["first_name", "last_name", "email", "number"];
	const filteredInvoices = invoices?.invoices
		?.filter((invoice) => invoice?.draft === (type === "estimate"))
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

	const navigate = useNavigate();
	const path = useLocation().pathname;

	return (
		<>
			<LoadingModal />
			{
				// <Outlet />

				location.pathname === "/estimates" ||
				location.pathname === "/estimates/" ||
				location.pathname === "/invoices" ||
				location.pathname === "/invoices/" ? (
					<div className="py-6">
						<div className="px-4 mx-auto mt-8 sm:px-6 md:px-8">
							<div className="space-y-5 sm:space-y-6">
								<div className="lg:col-span-9">
									<div className="flex items-center justify-between">
										<p className="flex-1 text-base font-bold text-gray-900">
											{type === "estimate" && "ESTIMATES"}
											{type === "invoice" && "INVOICES"}
										</p>

										<div className="inline-flex  items-center  justify-end ">
											<div className="flex  gap-2">
												{" "}
												<div className="flex-1 hidden max-w-xs ml-40 mr-auto lg:block">
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
															onChange={(e) => setSearch(e.target.value)}
															className="block  w-[250px] py-2 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
															placeholder="Type to search"
														/>
													</div>
												</div>
												{type === "estimate" && (
													<select
														id="sort"
														name="sort"
														className="block w-full py-2 pl-1   text-base bg-transparent border-gray-300 border-none rounded-lg focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
													>
														<option className="">All Estimates</option>
														<option className="">Viewed Estimates</option>
														<option>Not yet Viewed</option>
													</select>
												)}
												{type === "invoice" && (
													<select
														id="sort"
														name="sort"
														className="block  w-full py-2 pl-1  text-base bg-transparent border-gray-300 border-none rounded-lg focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
													>
														<option>All Invoices</option>
														<option>Paid Invoices</option>
														<option>Pending Invoices</option>
													</select>
												)}
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
																	<div className="flex items-center">NAME</div>
																</th>

																<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																	<div className="flex items-center">EMAIL</div>
																</th>

																<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																	<div className="flex items-center">PHONE</div>
																</th>

																<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																	<div className="flex items-center">
																		DUE DATE
																	</div>
																</th>

																<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																	<div className="flex items-center">
																		AMOUNT
																	</div>
																</th>

																<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																	<div className="flex items-center">
																		STATUS
																	</div>
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
																		const selectedInvoice =
																			filteredInvoices.find(
																				(q) =>
																					q.invoiceNumber ===
																					invoice.invoiceNumber
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
																			{invoice?.customer?.first_name}{" "}
																			{invoice?.customer?.last_name}
																		</div>
																		<div className="space-y-1 lg:hidden pl-4">
																			<p className="text-sm font-medium text-gray-500">
																				{invoice?.customer?.email}
																			</p>
																			<p className="text-sm font-medium text-gray-500">
																				{formatDate(invoice?.due)}
																			</p>
																		</div>
																	</td>
																	<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{invoice?.customer?.email}
																	</td>

																	<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{invoice?.customer?.phone?.country_code}{" "}
																		{invoice?.customer?.phone?.number}
																	</td>

																	<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{formatDate(invoice?.due)}
																	</td>

																	<td className="hidden px-4 py-4 text-sm font-bold text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{invoice?.order?.amount}{" "}
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
																				invoice?.status?.replace(/_/g, " ")}
																			{type === "estimate" && invoice?.status}
																		</div>
																	</td>

																	<td className="hidden  py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
																		<button
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
																		</button>
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
																					invoice?.status?.replace(/_/g, " ")}
																				{type === "estimate" && invoice?.status}
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
				)
			}
		</>
	);
}
