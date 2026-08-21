/* eslint-disable react/prop-types */
import { useStates } from "../../contexts/StatesContext";
import { useNavigate } from "react-router-dom";
import { calculateTotal } from "../../utils/helper-functions";
import { useEffect, useState } from "react";
import Loader from "../../components/Loader";

export default function CustomerEstimatesDashboard({ type }) {
	const { invoices, formatDate } = useStates();
	const [loading, setLoading] = useState(false);

	function handleFilter(type) {
		let updateFiltered = (invoices?.invoices || []).filter(
			(invoice) => invoice?.draft === (type === "estimate"),
		);

		if (type === "invoice") {
			updateFiltered = updateFiltered.filter(
				(inv) => inv.status !== "PAID" && inv.status !== "REQUIRE_APPROVAL",
			);
		} else if (type === "payment") {
			updateFiltered = updateFiltered.filter((inv) => inv.status === "PAID");
		}

		return updateFiltered;
	}

	const filteredInvoices = handleFilter(type);

	const navigate = useNavigate();

	useEffect(() => {
		if (filteredInvoices.length === 0) {
			setLoading(true);
		} else {
			setLoading(false);
		}
	}, [filteredInvoices.length]);

	return (
		<div className="p-4 bg-white">
			{loading ? (
				<Loader />
			) : (
				<div className="px-0 mx-auto max-w-7xl">
					<>
						<div className="flex items-center justify-between">
							<p className="text-xl font-bold text-gray-900">
								Recent {type} list
							</p>
						</div>
						<div className="flex flex-col mt-4 lg:mt-8">
							<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
								<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
									<table className="min-w-full lg:divide-y lg:divide-gray-200">
										<thead className="hidden lg:table-header-group">
											<tr>
												<th className="py-3.5 pl-4 pr-3 text-left text-sm border-r border-gray-200 whitespace-nowrap font-medium text-gray-500 sm:pl-6 md:pl-0">
													<div className="flex items-center">
														{type === "payment" ? "INVOICE" : "ESTIMATE"} ID
													</div>
												</th>

												<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
													<div className="flex items-center"> DATE ISSUED</div>
												</th>

												<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
													<div className="flex items-center">
														{type === "payment" ? "PAYMENT DATE" : "DUE DATE"}
													</div>
												</th>

												<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
													<div className="flex items-center">AMOUNT</div>
												</th>

												<th className=" border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
													<div className="flex items-center">STATUS</div>
												</th>
											</tr>
										</thead>

										<tbody className="divide-y divide-gray-200">
											{filteredInvoices?.map((invoice) => (
												<tr
													key={invoice?.invoiceNumber}
													className="hover:bg-gray-200 cursor-pointer "
													onClick={() => {
														if (type === "estimate") {
															navigate(
																`/customer-estimates/${invoice?.invoiceNumber}`,
															);
														} else {
															navigate(
																`/customer-payments/${invoice?.invoiceNumber}`,
															);
														}
													}}
												>
													<td className="lg:border-r  lg:border-gray-200 px-4 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
														<div className="px-5 py-3 ">
															<div className="flex items-start justify-between">
																<div className="flex items-center">
																	<div className="ml-3">
																		<p className="mt-1 text-sm font-bold text-gray-900">
																			{invoice?.invoiceNumber}
																		</p>
																	</div>
																</div>
															</div>
														</div>

														<div className="space-y-1 lg:hidden pl-11">
															<p className="text-sm font-medium text-gray-500">
																{invoice?.company}
															</p>
														</div>
													</td>

													<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
														{formatDate(invoice?.createdAt)}
													</td>

													<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
														{type === "payment"
															? formatDate(invoice?.updatedAt)
															: formatDate(invoice?.due)}
													</td>

													<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
														<div className="inline-flex items-center">
															{calculateTotal(invoice?.order?.items).toFixed(3)}{" "}
															{invoice?.order?.currency}
														</div>
													</td>

													<td className=" border-gray-200 hidden px-4 py-4 text-sm font-bold text-gray-900 lg:table-cell whitespace-nowrap">
														<div className="flex items-center gap-1">
															{" "}
															<svg
																className={`mr-1.5 h-2.5 w-2.5 ${
																	(invoice?.status === "DELIVERED" ||
																		invoice?.status === "PAID") &&
																	"text-green-500"
																} ${
																	invoice?.status === "APPROVED" &&
																	"text-blue-500"
																} ${
																	invoice?.status === "REQUIRE_APPROVAL" &&
																	"text-orange-500"
																}`}
																fill="currentColor"
																viewBox="0 0 8 8"
															>
																<circle cx="4" cy="4" r="3" />
															</svg>
															{invoice?.status}{" "}
															{type === "payment" &&
																`(${invoice?.paymentMethod})`}
														</div>
													</td>
												</tr>
											))}

											<tr />
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</>
				</div>
			)}
		</div>
	);
}
