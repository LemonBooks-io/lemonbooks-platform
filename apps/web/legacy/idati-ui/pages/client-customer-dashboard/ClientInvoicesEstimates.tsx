/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import SelectItem from "./SelectItem";
import { useStates } from "../../contexts/StatesContext";
import { postRequest } from "../../utils/fetch-function";
import { useNavigate, useParams } from "react-router-dom";
import { calculateTotal } from "../../utils/helper-functions";

export default function ClientInvoicesEstimates({ type }) {
	const {
		setServiceToAddBody,
		serviceToAddBody,
		selectedClient,
		userProfile,
		triggerUpdate,
		toast,
		isAddService,
		invoices,
		formatDate,
		setIsAddService,
		setAllItems,
	} = useStates();
	const [processing, setProcessing] = useState(false);

	function handleFilter(type) {
		let updateFiltered = (invoices?.invoices || [])
			.filter((invoice) => invoice?.draft === (type === "estimate"))
			.filter((invoice) => invoice?.recipientId === selectedClient?.id);

		if (type === "invoice") {
			updateFiltered = updateFiltered.filter(
				(inv) => inv.status !== "PAID" && inv.status !== "REQUIRE_APPROVAL",
			);
		} else if (type === "payment") {
			updateFiltered = updateFiltered.filter(
				(inv) => inv.status === "PAID" || inv.status === "REQUIRE_APPROVAL",
			);
		}

		return updateFiltered;
	}

	const filteredInvoices = handleFilter(type);

	useEffect(() => {
		setServiceToAddBody(null);
		setIsAddService(false);
		setAllItems([]);
	}, [setAllItems, setIsAddService, setServiceToAddBody]);

	const activeServices = [
		{
			id: 121,
			name: "Billing Platform Service",
			company: "Caffeine",
			email: "caffeine@fakeemail.com",
			cycle: "monthly",
			fee: "35 KWD",
		},
		{
			id: 233,
			name: "Revel POS Service",
			company: "Caffeine",
			email: "caffeine2@fakeemail.com",
			cycle: "yearly",
			fee: "500 KWD",
		},
	];

	const [search, setSearch] = useState("");

	const navigate = useNavigate();

	const { id } = useParams();

	function handleAbortAddService() {
		setIsAddService(false);
		setSearch("");
		setServiceToAddBody(null);
	}

	function handleChange(e) {
		const { name, value } = e.target;

		setServiceToAddBody((prev) => ({
			...prev,
			[name]: value,
		}));
	}

	async function handleAddService() {
		const body = {
			email: serviceToAddBody?.email,
			name: serviceToAddBody?.name,
		};

		setProcessing(true);

		const res = await postRequest(
			`business/create-and-add-service?customerId=${selectedClient?.id}&serviceCode=${serviceToAddBody?.serviceCode}`,
			body,
			userProfile?.accessToken,
			userProfile?.tenantId,
		);
		if (res) {
			toast.success(res?.message);
			setIsAddService(false);
			setServiceToAddBody(null);
			triggerUpdate();
		}

		setProcessing(false);
	}

	return (
		<div className="py-4 bg-white">
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
									{(activeServices.length > 0 || isAddService) && (
										<thead className="hidden lg:table-header-group">
											<tr>
												<th className="py-3.5 pl-4 pr-3 text-left text-sm border-r border-gray-200 whitespace-nowrap font-medium text-gray-500 sm:pl-6 md:pl-0">
													<div className="flex items-center">
														{type === "invoice" || type === "payment"
															? "INVOICE"
															: "ESTIMATE"}{" "}
														ID
													</div>
												</th>

												<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
													<div className="flex items-center"> DATE ISSUED</div>
												</th>

												<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
													<div className="flex items-center">
														{type === "invoice" || type === "estimate"
															? "DUE DATE"
															: "PAYMENT DATE"}
													</div>
												</th>

												<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
													<div className="flex items-center">AMOUNT</div>
												</th>

												<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
													<div className="flex items-center">STATUS</div>
												</th>

												<th className="relative py-3.5 pl-3 pr-4 sm:pr-6 md:pr-0">
													<span className="sr-only"> Actions </span>
												</th>
											</tr>
										</thead>
									)}

									<tbody className="divide-y divide-gray-200">
										{filteredInvoices?.map((invoice) => (
											<tr
												key={invoice?.invoiceNumber}
												className="hover:bg-gray-200 cursor-pointer "
												onClick={() => {
													navigate(`/${type}s/${invoice?.invoiceNumber}`);
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
													{type === "invoice" || type === "estimate"
														? formatDate(invoice?.due)
														: formatDate(invoice.updatedAt)}
												</td>

												<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													<div className="inline-flex items-center">
														{calculateTotal(invoice?.order?.items).toFixed(3)}{" "}
														{invoice?.order?.currency}
													</div>
												</td>

												<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-bold text-gray-900 lg:table-cell whitespace-nowrap">
													<div className="flex items-center gap-1">
														<svg
															className={`mr-1.5 h-2.5 w-2.5 ${
																invoice?.status === "UNPAID" && "text-red-500"
															} ${
																invoice?.status === "PAID" && "text-green-500"
															} ${
																invoice?.status === "REQUIRE_APPROVAL" &&
																"text-orange-500"
															} ${
																invoice?.status === "APPROVED" &&
																"text-blue-500"
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
														{type === "payment" &&
															invoice?.status?.replace(/_/g, " ")}
													
													</div>
												</td>
											</tr>
										))}
										{isAddService && (
											<tr>
												<td className="lg:border-r lg:border-gray-200 px-4 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
													<div className="ml-3">
														{" "}
														<SelectItem search={search} setSearch={setSearch} />
													</div>
												</td>

												<td className="border-r   border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													<input
														name="name"
														id="name"
														onChange={handleChange}
														value={serviceToAddBody?.name || ""}
														type="text"
														className="  text-gray-900  border-gray-300 focus:outline-none  transition duration-200 focus:bg-gray-200"
													/>
												</td>

												<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													<input
														name="email"
														id="email"
														onChange={handleChange}
														value={serviceToAddBody?.email || ""}
														type="text"
														className="w-full px-2 py-1 text-gray-900 border-gray-300 focus:outline-none  transition duration-200 focus:bg-gray-200"
													/>
												</td>

												<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													<input
														name="cycle"
														id="cycle"
														onChange={handleChange}
														value={serviceToAddBody?.cycle || ""}
														type="text"
														className=" w-[90px] px-2 py-1 text-gray-900 border-gray-300 focus:outline-none  transition duration-200 focus:bg-gray-200"
													/>
												</td>

												<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													<input
														name="serviceCost"
														id="serviceCost"
														onChange={handleChange}
														value={serviceToAddBody?.serviceCost || ""}
														type="text"
														className=" w-[90px] px-2 py-1 text-gray-900 border-gray-300 focus:outline-none  transition duration-200 focus:bg-gray-200"
													/>
												</td>

												<td className="px-4 py-4 text-sm font-medium text-right text-gray-900 whitespace-nowrap">
													<button
														onClick={handleAbortAddService}
														type="button"
														className="inline-flex p-2 -m-2 text-gray-400 transition-all duration-200 rounded  hover:text-gray-900"
													>
														<svg
															className="w-5 h-5"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth="2"
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													</button>
													<div className="mt-1 lg:hidden">
														<p>{serviceToAddBody?.serviceCost}</p>
														<div className="inline-flex items-center justify-end mt-1">
															{serviceToAddBody?.cycle}
														</div>
													</div>
												</td>
											</tr>
										)}
										<tr />
									</tbody>
								</table>

								{type !== "payment" && (
									<div className="flex  justify-between">
										{serviceToAddBody ? (
											<button
												onClick={handleAddService}
												type="button"
												className={`ml-4 h-[50px] lg:ml-0 mt-2 inline-flex items-center justify-center w-[200px] px-4 py-3 text-sm font-semibold leading-5 text-grey-700 transition-all duration-200 bg-gray-300 border border-transparent rounded-sm`}
											>
												{processing ? (
													<svg
														className="w-5  h-auto mx-auto text-gray-900 animate-spin "
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
													>
														<circle
															className="opacity-25"
															cx="12"
															cy="12"
															r="10"
															stroke="currentColor"
															strokeWidth="4"
														></circle>
														<path
															className="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
														></path>
													</svg>
												) : (
													<svg
														className="w-5 h-5 mr-1 "
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														strokeWidth="2"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M12 6v6m0 0v6m0-6h6m-6 0H6"
														/>
													</svg>
												)}
												{processing ? "Adding Service... " : "Add Service Now"}
											</button>
										) : (
											<button
												onClick={() => {
													navigate(`/clients/${id}/${type}s/create`);
												}}
												type="button"
												className={`ml-4 h-[50px] lg:ml-0 mt-2 inline-flex items-center justify-center w-[200px] px-4 py-3 text-sm font-semibold leading-5 text-grey-700 transition-all duration-200 bg-gray-300 border border-transparent rounded-sm`}
											>
												<svg
													className="w-5 h-5 mr-1 "
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													strokeWidth="2"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													/>
												</svg>
												Create new {type}
											</button>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</>
			</div>
		</div>
	);
}
