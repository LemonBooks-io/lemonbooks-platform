import { useEffect, useState } from "react";
import SelectItem from "./SelectItem";
import { useStates } from "../../contexts/StatesContext";
import {
	getRequest,
	patchRequest,
	postRequest,
} from "../../utils/fetch-function";

export default function ServicesTable() {
	const {
		predefinedServices,
		setServiceToAddBody,
		serviceToAddBody,
		selectedClient,
		userProfile,
		triggerUpdate,
		toast,
		isAddService,
		setIsAddService,
		tenant,
		setAllItems,
	} = useStates();
	const [processing, setProcessing] = useState(false);

	const [confirmRemove, setConfirmRemove] = useState({
		open: false,
		serviceId: null,
	});

	const [activeServices, setActiveServices] = useState([]);
	const [removing, setRemoving] = useState(false);

	useEffect(() => {}, [predefinedServices]);

	const itemInit = {
		amount: "0", //rate of each item
		currency: "KWD",
		name: "",
		description: "",
		quantity: "1",
	};

	const initService = {
		name: "",
		company: "",
		email: "",
		cycle: "",
		fee: "",
	};

	useEffect(() => {
		async function fetchServices() {
			const res = await getRequest(
				`customer/subscriptions/${selectedClient?.id}`,
				"",
				userProfile?.accessToken,
				tenant
			);

			setActiveServices(res?.data.filter((service) => !service.isCancelled));
		}

		fetchServices();
	}, [selectedClient, tenant, userProfile]);

	const [search, setSearch] = useState("");

	// eslint-disable-next-line no-unused-vars
	const [selectedItem, setSelectedItem] = useState(null);

	function handleInitiateAddService() {
		setIsAddService(true);
		setAllItems((prevItems) => [...prevItems, itemInit]);
		const init = {
			...initService,
			email: selectedClient?.email,
			company: selectedClient?.company,
		};

		setServiceToAddBody(() => init);
		setSelectedItem(null);
	}

	function handleAbortAddService() {
		setIsAddService(false);
		setSearch("");
		setServiceToAddBody(null);
	}

	async function handleRemoveItem(index) {
		try {
			setRemoving(true);
			const res = await patchRequest(
				`customer/subscription/cancel/${index}`,
				{},
				userProfile?.accessToken,
				""
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
			setRemoving(false);
			setConfirmRemove({ open: false, serviceId: null });
		}
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
			name: serviceToAddBody?.company,
		};

		const res = await postRequest(
			`business/create-and-add-service?customerId=${selectedClient?.id}&serviceCode=${serviceToAddBody?.serviceCode}`,
			body,
			userProfile?.accessToken,
			userProfile?.tenantId
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
		<div className="py-4 bg-white ">
			<div className="px-0 mx-auto max-w-7xl">
				{true && (
					<>
						{activeServices.length > 0 && (
							<div className="flex items-center justify-between">
								<p className="text-xl font-bold text-gray-900">
									Subscribed Services
								</p>
							</div>
						)}
						<div className="flex flex-col mt-4 lg:mt-5">
							<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
								<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
									<table className="min-w-full lg:divide-y lg:divide-gray-200">
										{(activeServices.length > 0 || isAddService) && (
											<thead className="hidden lg:table-header-group">
												<tr>
													<th className="py-3.5 pl-4 pr-3 text-left text-sm border-r border-gray-200 whitespace-nowrap font-medium text-gray-500 sm:pl-6 md:pl-0">
														<div className="flex items-center">
															SERVICE NAME
														</div>
													</th>

													<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
														<div className="flex items-center">
															SUBSCRIBED COMPANY
														</div>
													</th>

													<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
														<div className="flex items-center">
															LINKED EMAIL
														</div>
													</th>

													<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
														<div className="flex items-center">
															BILLING CYCLE
														</div>
													</th>

													<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
														<div className="flex items-center">
															SUBSCRIPTION FEE
														</div>
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
											{activeServices?.map((service) => (
												<tr key={service?.id}>
													<td className="lg:border-r lg:border-gray-200 px-4 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
														<div className="px-5 py-3 cursor-pointer">
															<div className="flex items-start justify-between">
																<div className="flex items-center">
																	<svg
																		className="flex-shrink-0 object-cover text-gray-600 w-6 h-6"
																		viewBox="0 0 140 140"
																		fill="none"
																		xmlns="http://www.w3.org/2000/svg"
																	>
																		<path
																			d="M100.625 61.25C107.871 61.25 113.75 55.3711 113.75 48.125C113.75 40.8789 107.871 35 100.625 35C93.3789 35 87.5 40.8789 87.5 48.125C87.5 55.3711 93.3789 61.25 100.625 61.25Z"
																			fill="black"
																		/>
																		<path
																			d="M123.594 17.5H16.4062C12.1406 17.5 8.75 20.9727 8.75 25.2383V114.762C8.75 119.027 12.1406 122.5 16.4062 122.5H123.594C127.859 122.5 131.25 119.027 131.25 114.762V25.2383C131.25 20.9727 127.859 17.5 123.594 17.5ZM95.4023 71.5586C94.582 70.6016 93.3242 69.8633 91.9023 69.8633C90.5078 69.8633 89.5234 70.5195 88.4023 71.4219L83.2891 75.7422C82.2227 76.5078 81.375 77.0273 80.1445 77.0273C78.9688 77.0273 77.9023 76.5898 77.1367 75.9063C76.8633 75.6602 76.3711 75.1953 75.9609 74.7852L61.25 58.8711C60.1562 57.6133 58.5156 56.8203 56.6836 56.8203C54.8516 56.8203 53.1563 57.7227 52.0898 58.9531L17.5 100.68V29.4492C17.7734 27.5898 19.2227 26.25 21.082 26.25H118.891C120.777 26.25 122.309 27.6445 122.418 29.5312L122.5 100.734L95.4023 71.5586Z"
																			fill="currentColor"
																		/>
																	</svg>

																	<div className="ml-3">
																		<p className="mt-1 text-sm font-bold text-gray-900">
																			{service?.service?.name}
																		</p>

																		<pre className="font-[300] text-xs">
																			{service?.description}
																		</pre>
																	</div>
																</div>
															</div>
														</div>

														<div className="space-y-1 lg:hidden pl-11">
															<p className="text-sm font-medium text-gray-500">
																{service?.customerCompany}
															</p>
														</div>
													</td>

													<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
														{service?.customerCompany}
													</td>

													<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-bold text-gray-900 lg:table-cell whitespace-nowrap">
														{service?.metaData?.customerDetails?.email}
													</td>

													<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
														<div className="inline-flex items-center">
															{service?.service?.serviceCycle?.duration}
														</div>
													</td>

													<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-bold text-gray-900 lg:table-cell whitespace-nowrap">
														{Number(service?.amount).toFixed(3)}{" "}
														{service?.service?.currency}
													</td>

													<td
														className={`border-r border-gray-200 hidden px-4 py-4 text-sm font-bold ${
															service?.isCancelled
																? "text-red-500"
																: "text-green-500"
														} lg:table-cell whitespace-nowrap`}
													>
														{service?.isCancelled ? "INACTIVE" : "ACTIVE"}
													</td>

													<td className="px-4 py-4 text-sm font-medium text-right text-gray-900 whitespace-nowrap">
														<button
															key={service?.id}
															onClick={() =>
																setConfirmRemove({
																	open: true,
																	serviceId: service?.id,
																})
															}
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
															<p>{service?.fee}</p>
															<div className="inline-flex items-center justify-end mt-1">
																{service?.cycle}
															</div>
														</div>
													</td>
												</tr>
											))}
											{isAddService && (
												<tr>
													<td className="lg:border-r lg:border-gray-200 px-4 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
														<div className="ml-3">
															{" "}
															<SelectItem
																search={search}
																setSearch={setSearch}
															/>
														</div>
													</td>

													<td className="border-r  border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
														<input
															name="company"
															id="company"
															onChange={handleChange}
															value={serviceToAddBody?.company || ""}
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

									<div className="flex  justify-between">
										{tenant === "administrator" &&
											(serviceToAddBody ? (
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
													{processing
														? "Adding Service... "
														: "Add Service Now"}
												</button>
											) : (
												<button
													onClick={handleInitiateAddService}
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
													{isAddService
														? "Confirm Addition "
														: "Add new Service"}
												</button>
											))}
									</div>
								</div>
							</div>
						</div>
					</>
				)}
			</div>

			{confirmRemove.open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="w-full max-w-md p-6 bg-white rounded shadow-lg">
						<h3 className="text-lg font-semibold text-gray-900">
							Confirm Removal
						</h3>

						<p className="mt-2 text-sm text-gray-600">
							Are you sure you want to remove this service? This action cannot
							be undone.
						</p>

						<div className="flex justify-end mt-6 space-x-3">
							<button
								onClick={() =>
									setConfirmRemove({ open: false, serviceId: null })
								}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
							>
								Cancel
							</button>

							<button
								onClick={() => {
									handleRemoveItem(confirmRemove.serviceId);
								}}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
							>
								{removing ? "Removing..." : "Remove"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
