/* eslint-disable react/prop-types */
import { useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import LoadingModal from "../loading/LoadingModal";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { differenceInDays } from "date-fns";
import { calculateTotal } from "../../utils/helper-functions";
import { postRequest } from "../../utils/fetch-function";

export default function InvoicesEstimatesDashboard({ type }) {
	const {
		formatDate,
		invoices,
		setSelectedInvoice,
		triggerUpdate,
		toast,
		userProfile,
	} = useStates();

	const [search, setSearch] = useState("");

	const navigate = useNavigate();
	const path = useLocation().pathname;

	const query = new URLSearchParams(location.search);
	const filter = query.get("filter");

	const filteredEstimates = invoices?.invoices
		?.filter(
			(invoice) =>
				(invoice.draft === true || invoice.draft === false) &&
				(invoice?.status === "DELIVERED" || invoice?.status === "APPROVED"),
		)
		?.filter((value) => {
			const fieldsToSearch = [
				"first_name",
				"last_name",
				"email",
				"number",
				"invoiceNumber",
			];
			return fieldsToSearch.some((field) => {
				let fieldValue;

				if (field === "email") {
					fieldValue = value?.customer?.email;
				} else if (field === "number") {
					fieldValue = value?.customer?.phone?.number;
				} else if (field === "first_name") {
					fieldValue = value?.customer?.first_name;
				} else if (field === "last_name") {
					fieldValue = value?.customer?.last_name;
				} else if (field === "invoiceNumber") {
					fieldValue = value?.invoiceNumber.toLowerCase();
				}

				return fieldValue
					?.toString()
					?.toLowerCase()
					.includes(search.toLowerCase());
			});
		});

	const filteredInvoices = invoices?.invoices
		?.filter(
			(invoice) => invoice?.draft === false && invoice?.status !== "DELIVERED",
		)

		// Exclude paid or approval-required
		?.filter(
			(invoice) =>
				invoice?.status !== "PAID" && invoice?.status !== "REQUIRE_APPROVAL",
		)

		// Apply overdue filters based on selected "filter" value (1week, 2weeks, 1month)
		?.filter((invoice) => {
			if (!filter) return true; // no filter — show all

			const now = new Date();
			const dueDate = new Date(invoice?.due);
			if (isNaN(dueDate)) return false;

			const daysOverdue = differenceInDays(now, dueDate);

			// Only show overdue invoices
			if (daysOverdue <= 0) return false;

			switch (filter) {
				case "1week":
					return daysOverdue > 7;
				case "2weeks":
					return daysOverdue > 14;
				case "1month":
					return daysOverdue > 30;
				default:
					return true;
			}
		})

		// Apply text search (name, email, phone)
		?.filter((value) => {
			const fieldsToSearch = [
				"first_name",
				"last_name",
				"email",
				"number",
				"invoiceNumber",
			];
			return fieldsToSearch.some((field) => {
				let fieldValue;

				if (field === "email") {
					fieldValue = value?.customer?.email;
				} else if (field === "number") {
					fieldValue = value?.customer?.phone?.number;
				} else if (field === "first_name") {
					fieldValue = value?.customer?.first_name;
				} else if (field === "last_name") {
					fieldValue = value?.customer?.last_name;
				} else if (field === "invoiceNumber") {
					fieldValue = value?.invoiceNumber.toLowerCase();
				}

				return fieldValue
					?.toString()
					?.toLowerCase()
					.includes(search.toLowerCase());
			});
		});

	const [confirmDeactivate, setConfirmDeactivate] = useState({
		open: false,
		invoiceId: null,
	});

	const [deactivating, setDeactivating] = useState(false);

	async function handleVoidInvoice(index) {
		try {
			setDeactivating(true);
			const res = await postRequest(
				`invoices/void-invoice/${index}`,
				{},
				userProfile?.accessToken,
				"",
			);

			if (res.success === true) {
				toast?.success(res.message);
				triggerUpdate();
			} else {
				toast?.error("Something went wrong");
			}
		} catch (err) {
			toast?.error(err?.response?.data?.error);
		} finally {
			setDeactivating(false);
			setConfirmDeactivate({ open: false, invoiceId: null });
		}
	}

	return (
		<>
			<LoadingModal />
			{location.pathname === "/estimates" ||
			location.pathname === "/estimates/" ||
			location.pathname === "/invoices" ||
			location.pathname === "/invoices/" ? (
				<div className="py-6">
					<div className="px-4 mx-auto mt-8 sm:px-6 md:px-8">
						<div className="space-y-5 sm:space-y-6">
							<div className="lg:col-span-9">
								<div className="flex items-center justify-between flex-wrap gap-4">
									<p className="text-base font-bold text-gray-900">
										{type === "estimate" && "ESTIMATES"}
										{type === "invoice" && "INVOICES"}
									</p>

									<div className="flex  gap-3 items-center">
										{/* Search Input */}
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
													className="block w-full py-2 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
													placeholder="Type to search"
												/>
											</div>
										</div>

										{/* Time Frame Filter */}
										{type === "invoice" && (
											<select
												value={filter || ""}
												onChange={(e) => {
													const selected = e.target.value;
													const query = new URLSearchParams(location.search);
													if (selected) query.set("filter", selected);
													else query.delete("filter");
													navigate(`${path}?${query.toString()}`, {
														replace: true,
													});
												}}
												className="block py-2 pl-2 pr-6 border border-gray-300 rounded-lg text-base bg-transparent focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
											>
												<option value="">All Time Frames</option>
												<option value="1week">Overdue 1+ Week</option>
												<option value="2weeks">Overdue 2+ Weeks</option>
												<option value="1month">Overdue 1+ Month</option>
											</select>
										)}

										{/* Existing invoice/estimate dropdown */}
										{type === "estimate" && (
											<select
												id="sort"
												name="sort"
												className="block w-fit py-2 pl-1 text-base bg-transparent border-gray-300 border-none rounded-lg focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
											>
												<option>All Estimates</option>
												<option>Viewed Estimates</option>
												<option>Not yet Viewed</option>
											</select>
										)}

										{type === "invoice" && (
											<select
												id="sort"
												name="sort"
												className="block w-fit py-2 pl-1 text-base border bg-transparent border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
											>
												<option>All Invoices</option>
												<option>Paid Invoices</option>
												<option>Pending Invoices</option>
											</select>
										)}
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
																<div className="flex items-center">
																	{type === "invoice"
																		? "INVOICE NO"
																		: "ESTIMATE NO"}
																</div>
															</th>

															{/* <th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																<div className="flex items-center">PHONE</div>
															</th> */}

															<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																<div className="flex items-center">
																	DUE DATE
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
														{type === "estimate" &&
															filteredEstimates?.map((estimate) => (
																<tr
																	onClick={() => {
																		const selectedInvoice =
																			filteredEstimates.find(
																				(q) =>
																					q.invoiceNumber ===
																					estimate.invoiceNumber,
																			);

																		if (selectedInvoice) {
																			setSelectedInvoice(selectedInvoice);
																			navigate(
																				`${path}/${selectedInvoice.invoiceNumber}`,
																			);
																		}
																	}}
																	key={estimate?.invoiceNumber}
																	className="cursor-pointer hover:bg-gray-200  "
																>
																	<td className="px-4  py-4 text-sm font-bold text-gray-900 sm:px-6 whitespace-nowrap">
																		<div className="inline-flex items-center">
																			{estimate?.customer?.company ||
																				estimate?.customer?.first_name +
																					" " +
																					estimate?.customer?.last_name}
																		</div>
																		<div className="space-y-1 lg:hidden pl-4">
																			<p className="text-sm font-medium text-gray-500">
																				{estimate?.invoiceNumber}
																			</p>
																			<p className="text-sm font-medium text-gray-500">
																				{formatDate(estimate?.due)}
																			</p>
																		</div>
																	</td>
																	<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{estimate?.invoiceNumber}
																	</td>

																	<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{formatDate(estimate?.due)}
																	</td>

																	<td className="hidden px-4 py-4 text-sm font-bold text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{calculateTotal(
																			estimate?.order?.items,
																		).toFixed(3)}{" "}
																		{estimate?.order?.currency}
																	</td>

																	<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		<div className="inline-flex items-center">
																			<svg
																				className={`mr-1.5 h-2.5 w-2.5 
																				${estimate?.status === "APPROVED" && "text-blue-500"}
																				${estimate?.status === "DELIVERED" && "text-green-500"}`}
																				fill="currentColor"
																				viewBox="0 0 8 8"
																			>
																				<circle cx="4" cy="4" r="3" />
																			</svg>
																			{type === "invoice" &&
																				estimate?.status?.replace(/_/g, " ")}
																			{type === "estimate" &&
																				estimate?.status?.replace(/_/g, " ")}
																		</div>
																	</td>

																	<td className="px-4 py-4 text-sm lg:hidden font-medium text-right text-gray-900 sm:px-6 whitespace-nowrap">
																		<div className=" py-4 text-sm font-bold text-gray-900  flex justify-end whitespace-nowrap">
																			{calculateTotal(
																				estimate?.order?.items,
																			).toFixed(3)}{" "}
																			{estimate?.order?.currency}
																		</div>
																		<div className="mt-1 lg:hidden">
																			<div className="inline-flex items-center justify-end mt-1">
																				<svg
																					className={`mr-1.5 h-2.5 w-2.5 
																				${estimate?.status === "APPROVED" && "text-blue-500"}
																				${estimate?.status === "DELIVERED" && "text-green-500"}`}
																					fill="currentColor"
																					viewBox="0 0 8 8"
																				>
																					<circle cx="4" cy="4" r="3" />
																				</svg>
																				{type === "invoice" &&
																					estimate?.status?.replace(/_/g, " ")}
																				{type === "estimate" &&
																					estimate?.status?.replace(/_/g, " ")}
																			</div>
																		</div>
																	</td>
																</tr>
															))}

														{type === "invoice" &&
															filteredInvoices?.map((invoice) => (
																<tr
																	onClick={() => {
																		const selectedInvoice =
																			filteredInvoices.find(
																				(q) =>
																					q.invoiceNumber ===
																					invoice.invoiceNumber,
																			);

																		if (selectedInvoice) {
																			setSelectedInvoice(selectedInvoice);
																			navigate(
																				`${path}/${selectedInvoice.invoiceNumber}`,
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
																				{formatDate(invoice?.due)}
																			</p>
																		</div>
																	</td>
																	<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{invoice?.invoiceNumber}
																	</td>

																	<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{formatDate(invoice?.due)}
																	</td>

																	<td className="hidden px-4 py-4 text-sm font-bold text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{calculateTotal(
																			invoice?.order?.items,
																		).toFixed(3)}{" "}
																		{invoice?.order?.currency}
																	</td>

																	<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		<div className="inline-flex items-center">
																			<svg
																				className={` mr-1.5 h-2.5 w-2.5 ${
																					invoice?.status === "UNPAID" &&
																					"text-red-500"
																				}`}
																				fill="currentColor"
																				viewBox="0 0 8 8"
																			>
																				<circle cx="4" cy="4" r="3" />
																			</svg>
																			{type === "invoice" &&
																				invoice?.status?.replace(/_/g, " ")}
																			{type === "estimate" &&
																				invoice?.status?.replace(/_/g, " ")}
																		</div>
																	</td>

																	<td className="px-4 py-4 text-sm lg:hidden font-medium text-right text-gray-900 sm:px-6 whitespace-nowrap">
																		<div className=" py-4 text-sm font-bold text-gray-900  flex justify-end whitespace-nowrap">
																			{Number(invoice?.order?.amount).toFixed(
																				3,
																			)}{" "}
																			{invoice?.order?.currency}
																		</div>
																		<div className="mt-1 lg:hidden">
																			<div className="inline-flex items-center justify-end mt-1">
																				<svg
																					className={`mr-1.5 h-2.5 w-2.5 ${
																						invoice?.status === "UNPAID" &&
																						"text-red-500"
																					}`}
																					fill="currentColor"
																					viewBox="0 0 8 8"
																				>
																					<circle cx="4" cy="4" r="3" />
																				</svg>
																				{type === "invoice" &&
																					invoice?.status?.replace(/_/g, " ")}
																				{type === "estimate" &&
																					invoice?.status?.replace(/_/g, " ")}
																			</div>
																		</div>
																	</td>

																	{invoice?.status === "UNPAID" && (
																		<td className="text-center hidden lg:block">
																			<button
																				onClick={(e) => {
																					e.stopPropagation();
																					setConfirmDeactivate({
																						open: true,
																						invoiceId: invoice?.id,
																					});
																				}}
																				className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
																			>
																				Void
																			</button>
																		</td>
																	)}
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

					{confirmDeactivate.open && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
							<div className="w-full max-w-md p-6 bg-white rounded shadow-lg">
								<h3 className="text-lg font-semibold text-gray-900">
									Confirm Voiding
								</h3>

								<p className="mt-2 text-sm text-gray-600">
									Are you sure you want to void this invoice? This action cannot
									be undone.
								</p>

								<div className="flex justify-end mt-6 space-x-3">
									<button
										onClick={() =>
											setConfirmDeactivate({ open: false, invoiceId: null })
										}
										className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
									>
										Cancel
									</button>

									<button
										onClick={() => {
											handleVoidInvoice(confirmDeactivate.invoiceId);
										}}
										className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
									>
										{deactivating ? "Processing..." : "Continue"}
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			) : (
				<Outlet />
			)}
		</>
	);
}
