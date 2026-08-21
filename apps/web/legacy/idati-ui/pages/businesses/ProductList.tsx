import React, { useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import { Chart21, FavoriteChart, Link } from "iconsax-react";

export default function ProductList({ productCategoryTab }) {
	const { items, categories, formatDate } = useStates();

	return (
		<div className="">
			<div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="flex flex-col mt-2 pb-6 ">
					<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
							{productCategoryTab === "PRODUCT" && (
								<table className="min-w-full lg:divide-gray-200 lg:divide-y">
									<thead className="hidden lg:table-header-group">
										<tr>
											<th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-widest">
												Item
											</th>

											<th className="py-3.5 px-4 text-left text-xs uppercase tracking-widest font-medium text-gray-500">
												Item Cost
											</th>

											<th className="py-3.5 px-4 text-left text-xs uppercase tracking-widest font-medium text-gray-500">
												Item Description
											</th>

											<th className="relative py-3.5 pl-4 pr-4 md:pr-0">
												<span className="sr-only"> Actions </span>
											</th>
										</tr>
									</thead>

									<tbody>
										{items?.items?.map((item) => (
											<tr key={item?.id} className="bg-white">
												<td className="px-4 py-2 text-sm font-bold text-gray-900 align-top lg:align-middle whitespace-nowrap">
													<div className="flex items-center">
														<Chart21 className=" w-6 h-6 text-gray-700 mr-3 " />

														{item?.itemName}
													</div>
													<div className="mt-1 space-y-2 font-medium pl-11 lg:hidden">
														<div className="flex items-center">
															<Link className="w-4 h-4 mr-2 text-gray-400" />
															{item?.cost} {item?.currency}
														</div>

														<div className="flex items-center">
															{item?.description}
														</div>

														<div className="flex items-center pt-3 space-x-4">
															<button
																type="button"
																className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none hover:text-white hover:border-indigo-600 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
															>
																Edit
															</button>
														</div>
													</div>
												</td>

												<td className="hidden px-4 py-2 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													<div className="flex items-center">
														<Link className="w-4 h-4 mr-2 text-gray-400" />
														{item?.cost} {item?.currency}
													</div>
												</td>

												<td className="hidden px-4 py-2 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													<div className="flex items-center">
														{item?.description}
													</div>
												</td>

												<td className="hidden px-4 py-2 lg:table-cell whitespace-nowrap">
													<div className="flex items-center space-x-4">
														<button
															type="button"
															className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none hover:text-white hover:border-indigo-600 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
														>
															Edit
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}

							{productCategoryTab === "CATEGORY" && (
								<table className="min-w-full lg:divide-gray-200 lg:divide-y">
									<thead className="hidden lg:table-header-group">
										<tr>
											<th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-widest">
												Category
											</th>

											<th className="py-3.5 px-4 text-left text-xs uppercase tracking-widest font-medium text-gray-500">
												Category ID
											</th>

											<th className="py-3.5 px-4 text-left text-xs uppercase tracking-widest font-medium text-gray-500">
												Updated At
											</th>

											<th className="relative py-3.5 pl-4 pr-4 md:pr-0">
												<span className="sr-only"> Actions </span>
											</th>
										</tr>
									</thead>

									<tbody>
										{categories.map((cat) => (
											<tr key={cat?.createdAt} className="bg-white">
												<td className="px-4 py-2 text-sm font-bold text-gray-900 align-top lg:align-middle whitespace-nowrap">
													<div className="flex items-center">
														<Chart21 className=" w-6 h-6 text-gray-700 mr-3 " />

														{cat?.categoryName}
													</div>
													<div className="mt-1 space-y-2 font-medium pl-11 lg:hidden">
														<div className="flex items-center">
															<Link className="w-4 h-4 mr-2 text-gray-400" />
															{cat?.id}
														</div>

														<div className="flex items-center">
															{formatDate(cat?.updatedAt)}
														</div>

														<div className="flex items-center pt-3 space-x-4">
															<button
																type="button"
																className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none hover:text-white hover:border-indigo-600 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
															>
																Edit
															</button>
														</div>
													</div>
												</td>

												<td className="hidden px-4 py-2 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													<div className="flex items-center">
														<Link className="w-4 h-4 mr-2 text-gray-400" />
														{cat?.id}
													</div>
												</td>

												<td className="hidden px-4 py-2 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													<div className="flex items-center">
														{formatDate(cat?.updatedAt)}
													</div>
												</td>

												<td className="hidden px-4 py-2 lg:table-cell whitespace-nowrap">
													<div className="flex items-center space-x-4">
														<button
															type="button"
															className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none hover:text-white hover:border-indigo-600 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
														>
															Edit
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
