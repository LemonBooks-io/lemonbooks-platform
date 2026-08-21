import React, { useState } from "react";

// import ChartDashboard from "./ChartDashboard";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";

export default function CustomerTabs() {
	const {
		handleLogout,
		userProfile,
		allClients,
		totalReceivables,
		businessInfo,
		invoices,
	} = useStates();

	const [search, setSearch] = useState("");

	const type = "invoice";

	const fieldsToSearch = ["first_name", "last_name", "email", "number"];
	const filteredInvoices = invoices?.invoices
		?.filter((invoice) => invoice?.draft === (type === "estimate"))
		?.filter((value) =>
			fieldsToSearch.some((field) => {
				let fieldValue;

				if (field === "email") {
					fieldValue = value?.customer?.email;
				} else if (field === "number") {
					fieldValue = value?.customer?.phone?.number;
				} else if (field === "first_name") {
					fieldValue = value?.customer?.first_name;
				} else if (field === "last_name") {
					fieldValue = value?.customer?.last_name;
				}

				return fieldValue?.toLowerCase().includes(search.toLowerCase());
			})
		);

	const navigate = useNavigate();
	return (
		<div className="flex flex-col">
			<header className="">
				<div className="py-3 bg-gray-900">
					<div className="container px-4 mx-auto">
						<div className="flex items-center justify-between ">
							<div className="block -m-2 lg:hidden">
								<button
									type="button"
									className="inline-flex items-center justify-center p-2 text-white bg-gray-900 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
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
											d="M4 6h16M4 12h16M4 18h16"
										></path>
									</svg>
								</button>
							</div>

							<div className="flex-shrink-0 ml-4 mr-4 lg:ml-0">
								<NavLink to="/" className="cursor-pointer flex ml-6 xl:ml-0">
									<div className="flex items-center gap-2 flex-shrink-0">
										<svg
											className="block w-auto h-7 "
											viewBox="0 0 80 80"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M68.0543 1.67383H11.9874C6.29189 1.67383 1.6748 6.29092 1.6748 11.9864V68.0534C1.6748 73.7488 6.29189 78.3659 11.9874 78.3659H68.0543C73.7498 78.3659 78.3669 73.7488 78.3669 68.0534V11.9864C78.3669 6.29092 73.7498 1.67383 68.0543 1.67383Z"
												fill="#2563EB"
											/>
											<path
												d="M26.1288 26.252H13.3455C11.7405 26.252 10.4395 27.553 10.4395 29.158V66.2929C10.4395 67.8979 11.7405 69.1989 13.3455 69.1989H26.1288C27.7337 69.1989 29.0348 67.8979 29.0348 66.2929V29.158C29.0348 27.553 27.7337 26.252 26.1288 26.252Z"
												fill="white"
											/>
											<path
												d="M47.9484 50.0547H35.7983C34.2728 50.0547 33.0361 51.0171 33.0361 52.2044V67.0678C33.0361 68.255 34.2728 69.2175 35.7983 69.2175H47.9484C49.4739 69.2175 50.7106 68.255 50.7106 67.0678V52.2044C50.7106 51.0171 49.4739 50.0547 47.9484 50.0547Z"
												fill="white"
											/>
											<path
												d="M72.5784 26.2521C72.5784 29.8581 71.5091 33.3832 69.5057 36.3816C67.5022 39.3799 64.6547 41.7168 61.3231 43.0968C57.9916 44.4768 54.3256 44.8378 50.7888 44.1343C47.2521 43.4308 44.0033 41.6943 41.4535 39.1445C38.9036 36.5946 37.1671 33.3459 36.4636 29.8091C35.7601 26.2723 36.1212 22.6064 37.5012 19.2748C38.8811 15.9432 41.218 13.0957 44.2164 11.0923C47.2147 9.08885 50.7398 8.01953 54.3458 8.01953L54.3458 26.2521H72.5784Z"
												fill="white"
											/>
										</svg>

										<div className="hidden w-auto text-2xl text-gray-100 font-bold lg:block">
											LemonBooks
										</div>
									</div>
								</NavLink>
							</div>

							<div className="flex items-center ml-4 lg:ml-0">
								<button
									type="button"
									className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
									id="options-menu-button"
									aria-expanded="false"
									aria-haspopup="true"
								>
									<span className="flex items-center justify-between w-full">
										<span className="flex items-center justify-between min-w-0 space-x-3">
											<svg
												onClick={handleLogout}
												className="flex-shrink-0 cursor-pointer object-cover text-red-600  rounded-full w-7 h-7"
												viewBox="0 0 24 24"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M12 10C13.1 10 14 9.1 14 8V4C14 2.9 13.1 2 12 2C10.9 2 10 2.9 10 4V8C10 9.1 10.9 10 12 10Z"
													fill="currentColor"
												/>
												<path
													d="M19.1 4.9C18.8 4.6 18.5 4.5 18 4.5C17.2 4.5 16.5 5.2 16.5 6C16.5 6.4 16.7 6.8 16.9 7.1C18.2 8.4 18.9 10.1 18.9 12C18.9 15.9 15.8 19 11.9 19C8 19 4.9 15.9 4.9 12C4.9 10.1 5.7 8.3 7 7.1C7.3 6.8 7.5 6.4 7.5 6C7.5 5.2 6.8 4.5 6 4.5C5.6 4.5 5.2 4.7 4.9 4.9C3.1 6.7 2 9.2 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 9.2 20.9 6.7 19.1 4.9Z"
													fill="currentColor"
												/>
											</svg>

											<span className="flex-1 hidden min-w-0 md:flex">
												<span className="text-sm font-medium text-white truncate">
													{" "}
													{businessInfo?.name}
												</span>
											</span>
										</span>
										<svg
											className="flex-shrink-0 w-4 h-4 ml-2 text-gray-400 group-hover:text-gray-500"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth="2"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M19 9l-7 7-7-7"
											></path>
										</svg>
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="hidden py-3 bg-white border-b  border-gray-200 lg:block">
					<div className="container px-4 mx-auto">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<NavLink
									to="/payments"
									title=""
									className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
								>
									<svg
										className="w-6 h-6 mr-2 -ml-1 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
										></path>
									</svg>
									Payments
									{/* <svg
                    className="w-5 h-5 ml-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg> */}
								</NavLink>
								<NavLink
									to="/invoices"
									title=""
									className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
								>
									<svg
										className="w-6 h-6 mr-2 -ml-1 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
										></path>
									</svg>
									Invoices
								</NavLink>

								<NavLink
									to="/estimates"
									title=""
									className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
								>
									<svg
										className="w-6 h-6 mr-2 -ml-1 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
										></path>
									</svg>
									Estimates
									{/* <svg
                    className="w-5 h-5 ml-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg> */}
								</NavLink>

								<NavLink
									to="/clients"
									className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100"
								>
									<svg
										className="w-6 h-6 mr-2 -ml-1 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
										></path>
									</svg>
									Payment History
								</NavLink>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="flex-1 overflow-x-hidden">
				<Outlet />
			</div>
		</div>
	);
}
