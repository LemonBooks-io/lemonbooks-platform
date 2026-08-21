import React, { useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import LoadingModal from "../loading/LoadingModal";

import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function UsersDashboard() {
	const {
		formatDate,
		invoices,
		setSelectedInvoice,
		toast,
		allUsers,
		allClients,
		setSelectedClient,
	} = useStates();

	const [search, setSearch] = useState("");

	const fieldsToSearch = ["name", "email"];
	const filteredUsers = allUsers?.users?.filter((value) =>
		fieldsToSearch.some((field) => {
			let fieldValue;

			if (field === "name") {
				fieldValue = value?.name;
			} else if (field === "email") {
				fieldValue = value?.email;
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

				location.pathname === "/users" || location.pathname === "/users/" ? (
					<div className="py-6">
						<div className="px-4 mx-auto mt-8 sm:px-6 md:px-8">
							<div className="space-y-5 sm:space-y-6">
								<div className="lg:col-span-9">
									<div className="flex items-center justify-between flex-wrap gap-4">
										<p className="text-base font-bold text-gray-900">USERS</p>

										{/* <div className="inline-flex items-center justify-end">
                      <div className="flex  gap-2">
                        {" "} */}
										<div className="flex sm:max-w-xs w-full order-3">
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
											<option className="">All Users</option>
											<option className="">Users Groups</option>
										</select>
										{/* </div>
                    </div> */}
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
																	<div className="flex items-center">ROLE</div>
																</th>

																<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
																	<div className="flex items-center">
																		PERMISSIONS
																	</div>
																</th>

																<th className="relative py-3.5 pl-3 pr-4 sm:pr-6 md:pr-0">
																	<span className="sr-only"> Actions </span>
																</th>
															</tr>
														</thead>

														<tbody className="divide-y divide-gray-200">
															{filteredUsers?.map((user) => (
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
																	key={user?.id}
																	className="cursor-pointer hover:bg-gray-200  "
																>
																	<td className="px-4  py-4 text-sm font-bold text-gray-900 sm:px-6 whitespace-nowrap">
																		<div className="inline-flex items-center">
																			{user?.name}{" "}
																		</div>
																		<div className="space-y-1 lg:hidden pl-4">
																			<p className="text-sm font-medium text-gray-500">
																				{user?.email}
																			</p>
																			<p className="text-sm font-medium text-gray-500">
																				{/* {formatDate(invoice?.due)} */}
																			</p>
																		</div>
																	</td>
																	<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{user?.email}
																	</td>

																	<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{user?.phone?.country_code}{" "}
																		{user?.phone?.number}
																	</td>

																	<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{user?.role}
																	</td>

																	<td className="hidden px-4 py-4 text-sm font-bold text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																		{/* {invoice?.order?.amount}{" "}
                                    {invoice?.order?.currency} */}
																		{user?.lastActive}
																	</td>

																	<td className="px-4 py-4 text-sm font-medium text-right text-gray-900  whitespace-nowrap">
																		<button
																			onClick={(e) => {
																				e.stopPropagation();
																				navigate(`/users/${user.id}/edit`);
																				const selected =
																					allUsers?.customers?.find(
																						(item) => item.id === user.id
																					);
																				setSelectedClient(selected);
																			}}
																			className="inline-flex items-center justify-center w-8 h-8 text-gray-400 transition-all duration-200 bg-white rounded-full border hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
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
																				></path>
																			</svg>
																		</button>
																	</td>

																	<td className="px-4 py-4 text-sm font-medium text-right text-gray-900 sm:px-6 whitespace-nowrap">
																		<div className="lg:hidden   text-sm font-bold text-gray-900  flex justify-end whitespace-nowrap">
																			{user?.role}
																		</div>
																		<div className="mt-1 lg:hidden">
																			<p>
																				{" "}
																				{user?.phone?.country_code}{" "}
																				{user?.phone?.number}
																			</p>
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
