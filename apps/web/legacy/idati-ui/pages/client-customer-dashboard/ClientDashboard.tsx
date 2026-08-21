import { useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import LoadingModal from "../loading/LoadingModal";
import { useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
// import { patchRequest } from "../../utils/fetch-function";

export default function ClientDashboard() {
	const { allClients, setSelectedClient } =
		useStates();

	const navigate = useNavigate();
	const [search, setSearch] = useState("");

	const fieldsToSearch = [
		"firstName",
		"lastName",
		"email",
		"number",
		"company",
	];

	const filteredClients = allClients?.customers?.filter((value) =>
		fieldsToSearch.some((field) => {
			let fieldValue;

			if (field === "email") {
				fieldValue = value?.email;
			} else if (field === "number") {
				fieldValue = value?.phone?.number;
			} else if (field === "firstName") {
				fieldValue = value?.firstName;
			} else if (field === "lastName") {
				fieldValue = value?.lastName;
			} else if (field === "company") {
				fieldValue = value?.company;
			}

			return fieldValue?.toLowerCase().includes(search.toLowerCase());
		}),
	);

	// const [confirmDeactivate, setConfirmDeactivate] = useState({
	// 	open: false,
	// 	clientId: null,
	// });

	// const [deactivating, setDeactivating] = useState(false);

	// async function handleRemoveItem(index) {
	// 	try {
	// 		setDeactivating(true);
	// 		const res = await patchRequest(
	// 			`customer/subscription/cancel/${index}`,
	// 			{},
	// 			userProfile?.accessToken,
	// 			"",
	// 		);

	// 		if (res.success === true) {
	// 			toast?.success(res.message);
	// 			triggerUpdate();
	// 		} else {
	// 			toast?.error("Something went wrong");
	// 		}
	// 	} catch (err) {
	// 		toast?.error(err?.response?.data?.error);
	// 	} finally {
	// 		setDeactivating(false);
	// 		setConfirmDeactivate({ open: false, clientId: null });
	// 	}
	// }

	return (
		<div className="py-6">
			<LoadingModal />
			{
				<div className="px-4 mx-auto mt-8 sm:px-6 md:px-8">
					<div className="space-y-5 sm:space-y-6">
						<div className="lg:col-span-9">
							<div className="flex items-center justify-between flex-wrap gap-4">
								<p className="text-base font-bold text-gray-900">
									CLIENTS & CUSTOMERS
								</p>

								<div className="flex w-full order-3 md:max-w-xs">
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
									id="sort"
									name="sort"
									className="block w-fit py-2 pl-1   text-base bg-transparent border-gray-300 border-none rounded-lg focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
								>
									<option>All Clients</option>
									<option>Has Account</option>
									<option>Has no Account</option>
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
																COMPANY NAME
															</div>
														</th>

														<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
															<div className="flex items-center">EMAIL</div>
														</th>

														<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
															<div className="flex items-center">PHONE NO.</div>
														</th>

														<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
															<div className="flex items-center">
																RECEIVABLES
															</div>
														</th>
													</tr>
												</thead>

												<tbody className="divide-y divide-gray-200">
													{filteredClients?.map((client) => (
														<tr
															key={client?.id}
															onClick={() => {
																navigate(`/clients/${client.id}`);
																const selected = allClients?.customers?.find(
																	(item) => item.id === client.id,
																);
																setSelectedClient(selected);
															}}
															className="cursor-pointer hover:bg-gray-200"
														>
															<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																{client?.firstName} {client?.lastName}
															</td>
															<td className="px-4 py-4 text-sm font-bold text-gray-900 sm:px-6 whitespace-nowrap">
																<div className="inline-flex items-center">
																	{client?.company}
																</div>
																<div className="space-y-1 lg:hidden pl-4">
																	<p className="text-sm font-medium text-gray-500">
																		{client?.firstName} {client?.lastName}
																	</p>
																	<p className="text-sm font-medium text-gray-500">
																		{client?.email}
																	</p>
																</div>
															</td>
															<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																{client?.email}
															</td>
															<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																<div className="inline-flex items-center">
																	{client?.phone?.countryCode}-
																	{client?.phone?.number}
																</div>
															</td>
															<td className="hidden px-4 py-4 text-sm font-bold text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																{Number(client?.receivables).toFixed(3)}
															</td>

															<td className="px-4 py-4 text-sm font-medium text-right text-gray-900 whitespace-nowrap">
																<Menu
																	as="div"
																	className="relative inline-block text-left"
																>
																	<MenuButton
																		onClick={(e) => e.stopPropagation()}
																		className="inline-flex items-center justify-center w-8 h-8 text-gray-400 transition-all duration-200 bg-white rounded-full border border-gray-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
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
																			/>
																		</svg>
																	</MenuButton>

																	<MenuItems className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-200 rounded-md shadow-lg focus:outline-none">
																		<div className="py-1 flex flex-col">
																			<MenuItem>
																				{() => (
																					<button
																						onClick={(e) => {
																							e.stopPropagation();
																							const selected =
																								allClients?.customers?.find(
																									(item) =>
																										item.id === client.id,
																								);
																							setSelectedClient(selected);
																							navigate(
																								`/clients/${client.id}/edit`,
																							);
																						}}
																						className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200`}
																					>
																						Edit Client
																					</button>
																				)}
																			</MenuItem>

																			<MenuItem>
																				{() => (
																					<button
																						onClick={(e) => {
																							e.stopPropagation();
																						}}
																						// onClick={(e) => {
																						// 	e.stopPropagation();
																						// 	setConfirmDeactivate({
																						// 		open: true,
																						// 		clientId: client?.id,
																						// 	});
																						// }}
																						className={`w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-200`}
																					>
																						Deactivate Client
																					</button>
																				)}
																			</MenuItem>
																		</div>
																	</MenuItems>
																</Menu>

																<div className="mt-1 lg:hidden">
																	<p>
																		{Number(client?.receivables).toFixed(3)}
																	</p>
																	<div className="inline-flex items-center justify-end mt-1">
																		{client?.phone?.country_code}-
																		{client?.phone?.number}
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
			}

			{/* {confirmDeactivate.open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="w-full max-w-md p-6 bg-white rounded shadow-lg">
						<h3 className="text-lg font-semibold text-gray-900">
							Confirm Deactivation
						</h3>

						<p className="mt-2 text-sm text-gray-600">
							Are you sure you want to deactivate this user? This action cannot
							be undone.
						</p>

						<div className="flex justify-end mt-6 space-x-3">
							<button
								onClick={() =>
									setConfirmDeactivate({ open: false, clientId: null })
								}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
							>
								Cancel
							</button>

							<button
								onClick={() => {
									handleRemoveItem(confirmDeactivate.clientId);
								}}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
							>
								{deactivating ? "Deactivating..." : "Deactivate"}
							</button>
						</div>
					</div>
				</div>
			)} */}
		</div>
	);
}
