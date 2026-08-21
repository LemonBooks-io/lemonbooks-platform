import { useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import LoadingModal from "../loading/LoadingModal";

export default function BusinessesDashboard() {
	const { productsAndServices } = useStates();

	const [search, setSearch] = useState("");

	const fieldsToSearch = ["name", "description"];
	const filteredProductsAndServices = productsAndServices?.offerings?.filter(
		(value) =>
			fieldsToSearch.some((field) => {
				let fieldValue;

				if (field === "name") {
					fieldValue = value?.name;
				} else if (field === "description") {
					fieldValue = value?.description;
				}

				return fieldValue?.toLowerCase().includes(search.toLowerCase());
			})
	);

	return (
		<div className="py-6">
			<LoadingModal />
			{
				<div className="px-4 mx-auto mt-8 sm:px-6 md:px-8">
					<div className="space-y-5 sm:space-y-6">
						<div className="lg:col-span-9">
							<div className="flex items-center justify-between">
								<p className="flex-1 text-base font-bold text-gray-900">
									PRODUCTS & SERVICES
								</p>

								<div className="inline-flex items-center justify-end">
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
										<select
											id="sort"
											name="sort"
											className="block w-full py-2 pl-1 pr-1 text-base bg-transparent border-gray-300 border-none rounded-lg focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
										>
											<option>Products & Services</option>
											<option>Products Only</option>
											<option>Services Only</option>
											<option>Categories</option>
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
															<div className="flex items-center">NAME</div>
														</th>

														<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
															<div className="flex items-center">TYPE</div>
														</th>

														<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
															<div className="flex items-center">
																DESCRIPTION
															</div>
														</th>

														<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
															<div className="flex items-center">COST</div>
														</th>

														<th className="py-3.5 px-4 text-left sm:px-6 text-sm whitespace-nowrap font-medium text-gray-500">
															<div className="flex items-center">
																SERVICE PERIOD
															</div>
														</th>
													</tr>
												</thead>

												<tbody className="divide-y divide-gray-200">
													{filteredProductsAndServices?.map((item) => (
														<tr
															key={item?.id}
															className="cursor-pointer hover:bg-gray-200"
														>
															<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																{item?.name}
															</td>
															<td className="px-4 py-4 text-sm font-bold text-gray-900 sm:px-6 whitespace-nowrap">
																<div className="inline-flex items-center">
																	{item?.type}
																</div>
																<div className="space-y-1 lg:hidden pl-4">
																	<p className="text-sm font-medium text-gray-500">
																		{item?.name}
																	</p>
																	<p className="text-sm font-medium text-gray-500">
																		{item?.description}
																	</p>
																</div>
															</td>
															<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																{item?.description?.slice(0, 30)}
															</td>
															<td className="hidden px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																<div className="inline-flex items-center">
																	{item?.cost} {item?.currency}
																</div>
															</td>
															<td className="hidden px-4 py-4 text-sm font-bold text-gray-900 sm:px-6 lg:table-cell whitespace-nowrap">
																{item?.serviceCycle || "N/A"}
															</td>
															<td className="px-4 py-4 text-sm font-medium text-right text-gray-900  whitespace-nowrap">
																<button className="inline-flex items-center justify-center w-8 h-8 text-gray-400 transition-all duration-200 bg-white rounded-full border hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
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
																<div className="mt-1 lg:hidden">
																	<p>
																		{item?.cost} {item?.currency}
																	</p>
																	<div className="inline-flex items-center justify-end mt-1">
																		{item?.serviceCycle}
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
		</div>
	);
}
