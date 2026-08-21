import React from "react";
import { useStates } from "../../contexts/StatesContext";
import { Link, UserOctagon } from "iconsax-react";

export default function CustomerList() {
	const { allClients } = useStates();

	return (
		<div className="">
			<div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="flex flex-col mt-2 pb-6 ">
					<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
							<table className="min-w-full lg:divide-gray-200 lg:divide-y">
								<thead className="hidden lg:table-header-group">
									<tr>
										<th className="py-3.5 px-2 text-left  text-sm whitespace-nowrap font-medium text-gray-500">
											<div className="flex items-center">Name</div>
										</th>

										<th className="py-3.5 px-2 text-left  text-sm whitespace-nowrap font-medium text-gray-500">
											<div className="flex items-center">Company Name</div>
										</th>

										<th className="py-3.5 px-2 text-left  text-sm whitespace-nowrap font-medium text-gray-500">
											<div className="flex items-center">Email</div>
										</th>

										<th className="py-3.5 px-2 text-left text-sm whitespace-nowrap font-medium text-gray-500">
											<div className="flex items-center">Phone No.</div>
										</th>

										<th className="py-3.5 px-2 text-left  text-sm whitespace-nowrap font-medium text-gray-500">
											<div className="flex items-center">Receivables</div>
										</th>

										<th className="relative py-3.5 pl-3 pr-4 sm:pr-2 md:pr-0">
											<span className="sr-only"> Actions </span>
										</th>
									</tr>
								</thead>

								<tbody>
									{allClients?.map((client) => (
										<tr key={client?.clientId} className="bg-white">
											<td className="hidden px-2 py-4 text-sm font-medium text-gray-900  lg:table-cell whitespace-nowrap">
												{client?.first_name} {client?.last_name}
											</td>

											<td className="px-2 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
												<div className="inline-flex items-center">
													{/* {client?.company} */}
													Company Name Here
												</div>
												<div className="space-y-1 lg:hidden pl-4">
													<p className="text-sm font-medium text-gray-500">
														{client?.first_name} {client?.last_name}
													</p>
													<p className="text-sm font-medium text-gray-500">
														{client?.phone?.country_code}{" "}
														{client?.phone?.number}
													</p>
												</div>
											</td>

											<td className="hidden px-2 py-4 text-sm font-medium text-gray-900  lg:table-cell whitespace-nowrap">
												{client?.email}
											</td>

											<td className="hidden px-2 py-4 text-sm font-medium text-gray-900  lg:table-cell whitespace-nowrap">
												{client?.phone?.country_code} {client?.phone?.number}
											</td>

											<td className="hidden px-2 py-4 text-sm font-bold text-gray-900  lg:table-cell whitespace-nowrap">
												$59.00
											</td>

											<td className="px-2 py-4 text-sm font-medium text-right text-gray-900  whitespace-nowrap">
												<button
													type="button"
													className="inline-flex items-center justify-center w-8 h-8 text-gray-400 transition-all duration-200 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
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
												<div className="mt-1 lg:hidden">
													<p>$59.00</p>
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
	);
}
