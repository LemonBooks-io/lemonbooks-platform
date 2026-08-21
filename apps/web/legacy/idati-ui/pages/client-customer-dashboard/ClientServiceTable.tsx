/* eslint-disable react/prop-types */
import { useStates } from "../../contexts/StatesContext";

export default function ClientServiceTable({ activeServices }) {
	const { isAddService, formatDate } = useStates();

	// function formatDate(dateString) {
	// 	const date = new Date(dateString);

	// 	const month = date.toLocaleString("en-US", { month: "short" });
	// 	const year = date.getFullYear();

	// 	// Always use the 1st
	// 	const day = 1;

	// 	return `${month} ${day}, ${year}`;
	// }

	return (
		<div className="py-4 bg-white border border-gray-300 rounded-xl">
			<div className="px-0 mx-auto max-w-7xl">
				<>
					<div className="flex px-4 items-center justify-between">
						<p className="text-md font-bold text-gray-900">Active Services</p>
					</div>

					<div className="flex flex-col mt-4 lg:mt-5">
						<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
							<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
								<table className="min-w-full lg:divide-y lg:divide-gray-200">
									{(activeServices?.length > 0 || isAddService) && (
										<thead className="hidden lg:table-header-group">
											<tr>
												<th className="py-3.5 pl-4 pr-3 text-left text-sm border-r border-gray-200 whitespace-nowrap font-medium text-gray-500 sm:pl-6 md:pl-0">
													<div className="pl-3 flex items-center">
														SERVICE NAME
													</div>
												</th>

												<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
													<div className="flex items-center">COMPANY</div>
												</th>

												<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
													<div className="flex items-center">BILLING CYCLE</div>
												</th>

												<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
													<div className="flex items-center">
														SUBSCRIPTION FEE
													</div>
												</th>

												<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
													<div className="flex items-center">NEXT DUE DATE</div>
												</th>

												<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
													<div className="flex items-center">STATUS</div>
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

													{/* <div className="space-y-1 lg:hidden pl-11">
														<p className="text-sm font-medium text-gray-500">
															{service?.customerCompany}
														</p>
													</div> */}
												</td>

												<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													{service?.customerCompany}
												</td>

												<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-bold text-gray-900 lg:table-cell whitespace-nowrap">
													{service?.service?.serviceCycle?.duration}
												</td>

												<td className="border-r border-gray-200 px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													<div className="lg:inline-flex  hidden items-center">
														{Number(service?.amount).toFixed(3)}{" "}
														{service?.service?.currency}
													</div>

													<div className="space-y-1 lg:hidden ">
														<p className="text-sm font-medium flex  text-gray-500">
															{service?.customerCompany}
														</p>
													</div>
												</td>

												<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-bold text-gray-900 lg:table-cell whitespace-nowrap">
													{service?.nextBillingDate
														? formatDate(service?.nextBillingDate)
														: ""}
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
		</div>
	);
}
