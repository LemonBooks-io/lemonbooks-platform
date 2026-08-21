import { useEffect } from "react";

import "react-phone-number-input/style.css";

import { NavLink, Outlet, matchPath, useParams } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";

import ClientSelector from "../invoices-estimate-dashboard/ClientSelector";

import ClientInfoBannar from "./ClientInfoBannar";
import InvoiceEstimateTopInfo from "../invoices-estimate-dashboard/InvoiceEstimateTopInfo";

export default function ClientDetails() {
	const { allClients, selectedClient, setSelectedClient, path } = useStates();

	const isMain = matchPath("/clients/:id", path);

	const { id } = useParams();

	const showInvoiceEstimateBanner =
		path === `/clients/${id}/invoices/create` ||
		path === `/clients/${id}/estimates/create`;

	useEffect(() => {
		if (id && allClients) {
			const selected = allClients?.customers?.find(
				(client) => client?.id === id
			);

			setSelectedClient(selected);
		}
	}, [id, allClients, path, setSelectedClient]);

	return (
		<section className="py-6 bg-white">
			<div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
				<div className="max-w-6xl mx-auto">
					<div className="">
						<nav className="flex justify-between gap-4 items-center flex-wrap">
							<ol
								role="list"
								className="flex items-center space-x-0.5 flex-wrap gap-4"
							>
								<li>
									<div className="-m-1">
										<NavLink
											to={`/clients/${id}`}
											className={({ isActive }) =>
												`p-1 cursor-pointer ml-0.5 text-sm font-medium   hover:text-gray-700 ${
													isActive && isMain
														? "border-b border-gray-400 text-gray-900"
														: "text-gray-500 "
												}`
											}
										>
											{" "}
											{selectedClient?.company}
										</NavLink>
									</div>
								</li>

								{/* <li>
									<div className="flex items-center">
										<svg
											className="flex-shrink-0 w-5 h-5 text-gray-300"
											xmlns="http://www.w3.org/2000/svg"
											fill="currentColor"
											viewBox="0 0 20 20"
											aria-hidden="true"
										>
											<path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
										</svg>
										<div className="-m-1">
											<NavLink
												to={`/clients/${id}/support`}
												className={({ isActive }) =>
													`p-1 cursor-pointer ml-0.5 text-sm font-medium   hover:text-gray-700 ${
														isActive
															? "border-b border-gray-400 text-gray-900"
															: "text-gray-500"
													}`
												}
											>
												{" "}
												Support Requests
											</NavLink>
										</div>
									</div>
								</li> */}

								<li>
									<div className="flex items-center">
										<svg
											className="flex-shrink-0 w-5 h-5 text-gray-300"
											xmlns="http://www.w3.org/2000/svg"
											fill="currentColor"
											viewBox="0 0 20 20"
											aria-hidden="true"
										>
											<path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
										</svg>
										<div className="-m-1">
											<NavLink
												to={`/clients/${id}/payments`}
												className={({ isActive }) =>
													`p-1 cursor-pointer ml-0.5 text-sm font-medium   hover:text-gray-700 ${
														isActive
															? "border-b border-gray-400 text-gray-900"
															: "text-gray-500 "
													}`
												}
											>
												{" "}
												Payments
											</NavLink>
										</div>
									</div>
								</li>
								<li>
									<div className="flex items-center">
										<svg
											className="flex-shrink-0 w-5 h-5 text-gray-300"
											xmlns="http://www.w3.org/2000/svg"
											fill="currentColor"
											viewBox="0 0 20 20"
											aria-hidden="true"
										>
											<path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
										</svg>
										<div className="-m-1">
											<NavLink
												to={`/clients/${id}/invoices`}
												className={({ isActive }) =>
													`p-1 cursor-pointer ml-0.5 text-sm font-medium   hover:text-gray-700 ${
														isActive
															? "border-b border-gray-400 text-gray-900"
															: "text-gray-500 "
													}`
												}
											>
												{" "}
												Invoices
											</NavLink>
										</div>
									</div>
								</li>
								<li>
									<div className="flex items-center">
										<svg
											className="flex-shrink-0 w-5 h-5 text-gray-300"
											xmlns="http://www.w3.org/2000/svg"
											fill="currentColor"
											viewBox="0 0 20 20"
											aria-hidden="true"
										>
											<path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
										</svg>
										<div className="-m-1">
											<NavLink
												to={`/clients/${id}/estimates`}
												className={({ isActive }) =>
													`p-1 cursor-pointer ml-0.5 text-sm font-medium   hover:text-gray-700 ${
														isActive
															? "border-b border-gray-400 text-gray-900"
															: "text-gray-500 "
													}`
												}
											>
												{" "}
												Estimates
											</NavLink>
										</div>
									</div>
								</li>
							</ol>
							<div className="flex ">
								<ClientSelector />
							</div>
						</nav>
					</div>

					<div className="grid grid-cols-1 mt-8 lg:grid-cols-5 lg:items-start xl:grid-cols-6 gap-y-10 lg:gap-x-12 xl:gap-x-16">
						<div className="pt-6 border-t border-gray-200 lg:order-1 lg:col-span-5 xl:col-span-6">
							<div className="flow-root">
								<div className="divide-y divide-gray-200 -my-7">
									{selectedClient &&
										(showInvoiceEstimateBanner ? (
											<InvoiceEstimateTopInfo />
										) : (
											<ClientInfoBannar selectedClient={selectedClient} />
										))}

									{selectedClient && (
										<div className="py-4">
											<Outlet />
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
