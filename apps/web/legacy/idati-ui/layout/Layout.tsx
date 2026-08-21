import { useEffect } from "react";

import {
	NavLink,
	Outlet,
	matchPath,
	useLocation,
	useNavigate,
} from "react-router-dom";

import { useStates } from "../contexts/StatesContext";
import {
	ArrowLeft2,
	MoneyArchive,
	MoneyRecive,
	Setting2,
	User,
} from "iconsax-react";
import {
	CloseButton,
	Popover,
	PopoverBackdrop,
	PopoverButton,
	PopoverPanel,
} from "@headlessui/react";

export default function Layout() {
	const navigate = useNavigate();

	const {
		setSelectedClient,
		path,
		setPath,
		handleLogout,
		downloadPayments,
		businessInfo,
	} = useStates();

	const selectedPath = useLocation().pathname;

	useEffect(() => {
		setPath(selectedPath);
	}, [selectedPath, setPath]);

	const showSideBar = path !== "/" && path !== "/changePassword";

	const isGoBack =
		path === "/settings" ||
		path === "/invoices/create" ||
		path === "/estimates/create" ||
		path === "/businesses/create" ||
		path === "/clients/create" ||
		path === "/users/create" ||
		path === "/products-services/create" ||
		matchPath("/clients/:id", path) ||
		matchPath("/payments/:id", path) ||
		matchPath("/clients/:id/edit", path) ||
		matchPath("/invoices/:id", path) ||
		matchPath("/estimates/:id", path) ||
		matchPath("/clients/:id/support", path) ||
		matchPath("/clients/:id/support", path) ||
		matchPath("/clients/:id/payments", path) ||
		matchPath("/clients/:id/estimates", path) ||
		matchPath("/clients/:id/invoices/create", path) ||
		matchPath("/clients/:id/estimates/create", path);

	const showButton = path !== "/";

	function navigateHandler() {
		if (path === "/payments") {
			downloadPayments();
		} else {
			navigate(path + "/create");
		}
	}

	function goBackHandler() {
		navigate(-1);
		setSelectedClient(null);
	}

	{
		return (
			<div className="flex flex-col">
				{showSideBar && (
					<header className="bg-white border-b border-gray-200">
						<div className="px-4 mx-auto">
							<div className="flex items-center justify-between h-16">
								<Popover className="block xl:hidden group">
									<PopoverButton className="inline-flex items-center justify-center p-2 text-gray-400 bg-white rounded-lg hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-gray-900 data-active:text-white data-focus:outline data-focus:outline-white data-hover:text-white">
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
									</PopoverButton>
									<PopoverBackdrop
										transition
										className="fixed inset-0 bg-black/80 transition duration-100 z-10 ease-out"
									/>
									<PopoverPanel
										transition
										className="fixed pr-4 pt-4 top-0 bottom-0 transition left-0 duration-200 ease-in z-20 w-full sm:w-1/2 bg-white"
									>
										{({ close }) => (
											<>
												<div className="relative">
													<CloseButton className="absolute right-0 inline-flex items-center justify-center p-2 text-white bg-gray-900 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 data-active:text-white data-focus:outline data-focus:outline-white data-hover:text-white">
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
																strokeWidth="2"
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													</CloseButton>
												</div>

												<div className="flex w-64 flex-col">
													<div className="flex flex-col pt-5 overflow-y-auto">
														<div className="flex flex-col justify-between flex-1 h-full px-4">
															<div className="space-y-4">
																<div>
																	{showButton ? (
																		isGoBack ? (
																			<CloseButton
																				onClick={goBackHandler}
																				type="button"
																				className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500`}
																			>
																				<ArrowLeft2 className="w-5 h-5 mr-1 text-white" />
																				Go Back
																			</CloseButton>
																		) : (
																			<CloseButton
																				onClick={navigateHandler}
																				type="button"
																				className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500`}
																			>
																				<svg
																					className="w-5 h-5 mr-1"
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
																				{path === "/businesses" &&
																					"Create Business"}
																				{path === "/administrator" &&
																					"Create Business"}
																				{path === "/invoices" &&
																					"Create New Invoice"}
																				{path === "/clients" &&
																					"Create New Client"}
																				{path === "/estimates" &&
																					"Create New Estimate"}
																				{path === "/products-services" &&
																					"Add Products/Services"}
																				{path === "/users" && "Add New User"}
																				{path === "/payments" &&
																					"Download Payments"}
																			</CloseButton>
																		)
																	) : (
																		// Optional: Only include if necessary for layout
																		<div className="inline-flex items-center justify-center w-full px-4 py-5 text-sm font-semibold leading-5 text-transparent">
																			{/* Placeholder to maintain space */}
																		</div>
																	)}
																</div>

																<div>
																	<nav className="flex-1 mt-16 space-y-1">
																		<NavLink
																			to="/payments"
																			title=""
																			onClick={async () => {
																				close();
																			}}
																			className={({ isActive }) =>
																				`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
																					isActive
																						? "bg-gray-200 text-gray-900"
																						: "text-gray-500 hover:bg-gray-200"
																				}`
																			}
																		>
																			<MoneyRecive className="flex-shrink-0 w-6 h-6 mr-4 text-[#2B3344]" />
																			Payments
																		</NavLink>
																		<NavLink
																			to="/invoices"
																			title=""
																			onClick={async () => {
																				close();
																			}}
																			className={({ isActive }) =>
																				`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
																					isActive
																						? "bg-gray-200 text-gray-900"
																						: "text-gray-500 hover:bg-gray-200"
																				}`
																			}
																		>
																			<svg
																				className="flex-shrink-0 w-6 h-6 mr-4"
																				viewBox="0 0 24 24"
																				fill="none"
																				xmlns="http://www.w3.org/2000/svg"
																			>
																				<path
																					d="M22 9H19V2C19 1.81429 18.9483 1.63225 18.8507 1.47427C18.753 1.31629 18.6133 1.18863 18.4472 1.10557C18.2811 1.02252 18.0952 0.987363 17.9102 1.00404C17.7252 1.02072 17.5486 1.08857 17.4 1.2L15.33 2.75C12.21 0.420001 13.1 0.420001 10 2.75C6.89 0.420001 7.77 0.420001 4.66 2.75L2.6 1.2C2.45143 1.08857 2.27477 1.02072 2.08981 1.00404C1.90484 0.987363 1.71889 1.02252 1.55279 1.10557C1.38668 1.18863 1.24698 1.31629 1.14935 1.47427C1.05171 1.63225 1 1.81429 1 2V20C1 20.7956 1.31607 21.5587 1.87868 22.1213C2.44129 22.6839 3.20435 23 4 23H20C20.7956 23 21.5587 22.6839 22.1213 22.1213C22.6839 21.5587 23 20.7956 23 20V10C23 9.73478 22.8946 9.48043 22.7071 9.29289C22.5196 9.10536 22.2652 9 22 9ZM4 21C3.73478 21 3.48043 20.8946 3.29289 20.7071C3.10536 20.5196 3 20.2652 3 20V4C5 5.47 4.41 5.44 7.33 3.25C10.43 5.58 9.55 5.58 12.66 3.25C15.66 5.49 15.08 5.44 17 4C17 20.75 16.92 20.3 17.17 21H4ZM21 20C21 20.2652 20.8946 20.5196 20.7071 20.7071C20.5196 20.8946 20.2652 21 20 21C19.7348 21 19.4804 20.8946 19.2929 20.7071C19.1054 20.5196 19 20.2652 19 20V11H21V20Z"
																					fill="black"
																				/>
																				<path
																					d="M14 17H6C5.73478 17 5.48043 17.1054 5.29289 17.2929C5.10536 17.4804 5 17.7348 5 18C5 18.2652 5.10536 18.5196 5.29289 18.7071C5.48043 18.8946 5.73478 19 6 19H14C14.2652 19 14.5196 18.8946 14.7071 18.7071C14.8946 18.5196 15 18.2652 15 18C15 17.7348 14.8946 17.4804 14.7071 17.2929C14.5196 17.1054 14.2652 17 14 17Z"
																					fill="black"
																				/>
																				<path
																					d="M8.63047 9.51453C8.63047 8.96662 9.43183 8.87306 10.1269 8.87306C10.7821 8.87306 11.6773 9.18011 12.4258 9.56817L12.5725 8.05802C12.1982 7.84401 11.3298 7.59003 10.4477 7.53696L10.6614 6H9.2315L9.44556 7.53696C7.60151 7.71044 7 8.77945 7 9.6749C7 11.9332 11.2091 11.4527 11.2091 12.8419C11.2091 13.3635 10.7151 13.5502 9.84621 13.5502C8.67048 13.5502 7.78815 13.1363 7.33413 12.7084L7.10672 14.4057C7.53475 14.6597 8.40287 14.8868 9.44556 14.9404L9.2315 16.4238H10.6614L10.4477 14.9268C12.6125 14.7396 13 13.5902 13 12.8288C13 10.1429 8.63047 10.8107 8.63047 9.51453Z"
																					fill="black"
																				/>
																			</svg>
																			Invoices
																		</NavLink>

																		<NavLink
																			to="/estimates"
																			title=""
																			onClick={async () => {
																				close();
																			}}
																			className={({ isActive }) =>
																				`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
																					isActive
																						? "bg-gray-200 text-gray-900"
																						: "text-gray-500 hover:bg-gray-200"
																				}`
																			}
																		>
																			<MoneyArchive className="flex-shrink-0 w-6 h-6 mr-4 text-[#2B3344]" />
																			Estimates
																		</NavLink>

																		<NavLink
																			to="/clients"
																			title=""
																			onClick={async () => {
																				close();
																			}}
																			className={({ isActive }) =>
																				`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
																					isActive
																						? "bg-gray-200 text-gray-900"
																						: "text-gray-500 hover:bg-gray-200"
																				}`
																			}
																		>
																			<svg
																				className="flex-shrink-0 w-6 h-6 mr-4"
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
																				/>
																			</svg>
																			Clients & Customers
																		</NavLink>

																		<NavLink
																			to="/products-services"
																			title=""
																			onClick={async () => {
																				close();
																			}}
																			className={({ isActive }) =>
																				`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
																					isActive
																						? "bg-gray-200 text-gray-900"
																						: "text-gray-500 hover:bg-gray-200"
																				}`
																			}
																		>
																			<svg
																				className="flex-shrink-0 w-6 h-6 mr-4"
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
																				/>
																			</svg>
																			Products & Services
																		</NavLink>
																	</nav>
																</div>
															</div>

															<div className="pb-4 mt-12">
																<nav className="flex-1 space-y-1">
																	{/* {tenant === "administrator" && (
																		<NavLink
																			to=""
																			title=""
																			onClick={async () => {
																				close();
																			}}
																			className={({ isActive }) =>
																				`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
																					isActive
																						? "bg-gray-200 text-gray-900"
																						: "text-gray-500 hover:bg-gray-200"
																				}`
																			}
																		>
																			<Briefcase className="flex-shrink-0 w-6 h-6 mr-4 text-[#2B3344]" />
																			Businesses
																		</NavLink>
																	)} */}
																	<NavLink
																		to="/users"
																		title=""
																		onClick={async () => {
																			close();
																		}}
																		className={({ isActive }) =>
																			`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
																				isActive
																					? "bg-gray-200 text-gray-900"
																					: "text-gray-500 hover:bg-gray-200"
																			}`
																		}
																	>
																		<User className="flex-shrink-0 w-6 h-6 mr-4 text-[#2B3344]" />
																		Users
																	</NavLink>
																	<NavLink
																		to="/settings"
																		title=""
																		onClick={async () => {
																			close();
																		}}
																		className={({ isActive }) =>
																			`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
																				isActive
																					? "bg-gray-200 text-gray-900"
																					: "text-gray-500 hover:bg-gray-200"
																			}`
																		}
																	>
																		<Setting2 className="flex-shrink-0 w-6 h-6 mr-4 text-[#2B3344]" />
																		Settings
																	</NavLink>

																	<a
																		onClick={handleLogout}
																		title=""
																		className="flex cursor-pointer items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 text-gray-900 rounded-lg hover:bg-gray-200 group"
																	>
																		<svg
																			className="flex-shrink-0 w-6 h-6 mr-4"
																			xmlns="http://www.w3.org/2000/svg"
																			fill="none"
																			viewBox="0 0 24 24"
																			stroke="currentColor"
																			strokeWidth="2"
																		>
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
																			/>
																		</svg>
																		Logout
																	</a>
																</nav>
															</div>
														</div>
													</div>
												</div>
											</>
										)}
									</PopoverPanel>
								</Popover>

								<NavLink to="/" className="cursor-pointer flex ml-6 xl:ml-0">
									<div className="flex items-center gap-2 flex-shrink-0">
										{businessInfo?.logoUrl ? (
											<img
												src={businessInfo?.logoUrl}
												alt="Business Logo"
												className="block w-auto h-7"
											/>
										) : (
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
										)}

										<div className="hidden w-auto text-2xl text-gray-700 font-bold lg:block">
											{businessInfo?.name ? businessInfo?.name : "LemonBooks"}
										</div>
									</div>
								</NavLink>
							</div>
						</div>
					</header>
				)}

				<div className="flex flex-1">
					{showSideBar && (
						<div className="hidden xl:flex xl:w-64 xl:flex-col">
							<div className="flex flex-col pt-5 overflow-y-auto">
								<div className="flex flex-col justify-between flex-1 h-full px-4">
									<div className="space-y-4">
										<div>
											{showButton ? (
												isGoBack ? (
													<button
														onClick={goBackHandler}
														type="button"
														className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500`}
													>
														<ArrowLeft2 className="w-5 h-5 mr-1 text-white" />
														Go Back
													</button>
												) : (
													<button
														onClick={navigateHandler}
														type="button"
														className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500`}
													>
														<svg
															className="w-5 h-5 mr-1"
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
														{path === "/businesses" && "Create Business"}
														{path === "/administrator" && "Create Business"}
														{path === "/invoices" && "Create New Invoice"}
														{path === "/clients" && "Create New Client"}
														{path === "/estimates" && "Create New Estimate"}
														{path === "/products-services" &&
															"Add Products/Services"}
														{path === "/users" && "Add New User"}
														{path === "/payments" && "Download Payments"}
													</button>
												)
											) : (
												// Optional: Only include if necessary for layout
												<div className="inline-flex items-center justify-center w-full px-4 py-5 text-sm font-semibold leading-5 text-transparent">
													{/* Placeholder to maintain space */}
												</div>
											)}
										</div>

										<div>
											<nav className="flex-1 mt-16 space-y-1">
												<NavLink
													to="/payments"
													title=""
													className={({ isActive }) =>
														`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
															isActive
																? "bg-gray-200 text-gray-900"
																: "text-gray-500 hover:bg-gray-200"
														}`
													}
												>
													<MoneyRecive className="flex-shrink-0 w-6 h-6 mr-4 text-[#2B3344]" />
													Payments
												</NavLink>
												<NavLink
													to="/invoices"
													title=""
													className={({ isActive }) =>
														`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
															isActive
																? "bg-gray-200 text-gray-900"
																: "text-gray-500 hover:bg-gray-200"
														}`
													}
												>
													<svg
														className="flex-shrink-0 w-6 h-6 mr-4"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M22 9H19V2C19 1.81429 18.9483 1.63225 18.8507 1.47427C18.753 1.31629 18.6133 1.18863 18.4472 1.10557C18.2811 1.02252 18.0952 0.987363 17.9102 1.00404C17.7252 1.02072 17.5486 1.08857 17.4 1.2L15.33 2.75C12.21 0.420001 13.1 0.420001 10 2.75C6.89 0.420001 7.77 0.420001 4.66 2.75L2.6 1.2C2.45143 1.08857 2.27477 1.02072 2.08981 1.00404C1.90484 0.987363 1.71889 1.02252 1.55279 1.10557C1.38668 1.18863 1.24698 1.31629 1.14935 1.47427C1.05171 1.63225 1 1.81429 1 2V20C1 20.7956 1.31607 21.5587 1.87868 22.1213C2.44129 22.6839 3.20435 23 4 23H20C20.7956 23 21.5587 22.6839 22.1213 22.1213C22.6839 21.5587 23 20.7956 23 20V10C23 9.73478 22.8946 9.48043 22.7071 9.29289C22.5196 9.10536 22.2652 9 22 9ZM4 21C3.73478 21 3.48043 20.8946 3.29289 20.7071C3.10536 20.5196 3 20.2652 3 20V4C5 5.47 4.41 5.44 7.33 3.25C10.43 5.58 9.55 5.58 12.66 3.25C15.66 5.49 15.08 5.44 17 4C17 20.75 16.92 20.3 17.17 21H4ZM21 20C21 20.2652 20.8946 20.5196 20.7071 20.7071C20.5196 20.8946 20.2652 21 20 21C19.7348 21 19.4804 20.8946 19.2929 20.7071C19.1054 20.5196 19 20.2652 19 20V11H21V20Z"
															fill="black"
														/>
														<path
															d="M14 17H6C5.73478 17 5.48043 17.1054 5.29289 17.2929C5.10536 17.4804 5 17.7348 5 18C5 18.2652 5.10536 18.5196 5.29289 18.7071C5.48043 18.8946 5.73478 19 6 19H14C14.2652 19 14.5196 18.8946 14.7071 18.7071C14.8946 18.5196 15 18.2652 15 18C15 17.7348 14.8946 17.4804 14.7071 17.2929C14.5196 17.1054 14.2652 17 14 17Z"
															fill="black"
														/>
														<path
															d="M8.63047 9.51453C8.63047 8.96662 9.43183 8.87306 10.1269 8.87306C10.7821 8.87306 11.6773 9.18011 12.4258 9.56817L12.5725 8.05802C12.1982 7.84401 11.3298 7.59003 10.4477 7.53696L10.6614 6H9.2315L9.44556 7.53696C7.60151 7.71044 7 8.77945 7 9.6749C7 11.9332 11.2091 11.4527 11.2091 12.8419C11.2091 13.3635 10.7151 13.5502 9.84621 13.5502C8.67048 13.5502 7.78815 13.1363 7.33413 12.7084L7.10672 14.4057C7.53475 14.6597 8.40287 14.8868 9.44556 14.9404L9.2315 16.4238H10.6614L10.4477 14.9268C12.6125 14.7396 13 13.5902 13 12.8288C13 10.1429 8.63047 10.8107 8.63047 9.51453Z"
															fill="black"
														/>
													</svg>
													Invoices
												</NavLink>

												<NavLink
													to="/estimates"
													title=""
													className={({ isActive }) =>
														`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
															isActive
																? "bg-gray-200 text-gray-900"
																: "text-gray-500 hover:bg-gray-200"
														}`
													}
												>
													<MoneyArchive className="flex-shrink-0 w-6 h-6 mr-4 text-[#2B3344]" />
													Estimates
												</NavLink>

												<NavLink
													to="/clients"
													title=""
													className={({ isActive }) =>
														`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
															isActive
																? "bg-gray-200 text-gray-900"
																: "text-gray-500 hover:bg-gray-200"
														}`
													}
												>
													<svg
														className="flex-shrink-0 w-6 h-6 mr-4"
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
														/>
													</svg>
													Clients & Customers
												</NavLink>

												<NavLink
													to="/products-services"
													title=""
													className={({ isActive }) =>
														`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
															isActive
																? "bg-gray-200 text-gray-900"
																: "text-gray-500 hover:bg-gray-200"
														}`
													}
												>
													<svg
														className="flex-shrink-0 w-6 h-6 mr-4"
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
														/>
													</svg>
													Products & Services
												</NavLink>
											</nav>
										</div>
									</div>

									<div className="pb-4 mt-12">
										<nav className="flex-1 space-y-1">
											{/* {tenant === "administrator" && (
												<NavLink
													to=""
													title=""
													className={({ isActive }) =>
														`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
															isActive
																? "bg-gray-200 text-gray-900"
																: "text-gray-500 hover:bg-gray-200"
														}`
													}
												>
													<Briefcase className="flex-shrink-0 w-6 h-6 mr-4 text-[#2B3344]" />
													Businesses
												</NavLink>
											)} */}
											<NavLink
												to="/users"
												title=""
												className={({ isActive }) =>
													`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
														isActive
															? "bg-gray-200 text-gray-900"
															: "text-gray-500 hover:bg-gray-200"
													}`
												}
											>
												<User className="flex-shrink-0 w-6 h-6 mr-4 text-[#2B3344]" />
												Users
											</NavLink>
											<NavLink
												to="/settings"
												title=""
												className={({ isActive }) =>
													`flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group ${
														isActive
															? "bg-gray-200 text-gray-900"
															: "text-gray-500 hover:bg-gray-200"
													}`
												}
											>
												<Setting2 className="flex-shrink-0 w-6 h-6 mr-4 text-[#2B3344]" />
												Settings
											</NavLink>

											<a
												onClick={handleLogout}
												title=""
												className="flex cursor-pointer items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 text-gray-900 rounded-lg hover:bg-gray-200 group"
											>
												<svg
													className="flex-shrink-0 w-6 h-6 mr-4"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													strokeWidth="2"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
													/>
												</svg>
												Logout
											</a>
										</nav>
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="flex flex-col flex-1 overflow-x-hidden">
						<main>
							{" "}
							<Outlet />
						</main>
					</div>
				</div>
			</div>
		);
	}
}
