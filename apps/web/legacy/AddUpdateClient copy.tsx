import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";
import ReturnHome from "../return-home/ReturnHome";
import AccountTypeSelector from "../../components/AccountTypeSelector";
import { Alarm, CloseCircle, Link1, TagUser, User } from "iconsax-react";
import SelectPermissions from "../../components/SelectPermissions";
import SelectServices from "../../components/SelectServices";
import Button from "../../components/Button";
import axios from "axios";
import SelectClientServices from "./SelectClientServices";

export default function AddUpdateClient() {
	const {
		isLogin,
		isClient,
		accountType,
		accessToken,
		BASE_URL,
		setAccountType,
		setIsFetching,
		setUpdateData,
		allServices,
	} = useStates();
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [enteredName, setEnteredName] = useState("");
	const [permissionArray, setPermissionArray] = useState([]);
	const [establishmentId, setEstablishmentId] = useState([]);
	const [estIdStr, setEstIdStr] = useState("");
	const [enteredUrl, setEnteredUrl] = useState("");
	const [selectedServices, setSelectedServices] = useState([]);

	const navigate = useNavigate();

	const permitArr = [
		{ permission: "ALL", title: "All Permissions", isSelected: false },
		{ permission: "CREATE ADMIN", title: "Create Admins", isSelected: false },
		{ permission: "DELETE ADMIN", title: "Delete Admins", isSelected: false },
		{ permission: "CREATE CLIENT", title: "Create Clients", isSelected: false },
		{ permission: "DELETE CLIENT", title: "Delete Clients", isSelected: false },
	];

	const [permissions, setPermissions] = useState(permitArr);

	const selectedPermission = permissions
		.filter((permission) => permission.isSelected)
		.map((permission) => permission.permission);

	function getEstArray(input) {
		if (input.length === 0) {
			return [];
		}
		// Split the string, trim spaces, and validate integers

		return input.split(",").map((element) => {
			const trimmed = element.trim();

			// Check if the element is a valid integer (strict match for digits only)
			if (!/^\d+$/.test(trimmed)) {
				alert(`Invalid integer found: "${trimmed}"`);
				throw new Error(`Invalid integer: ${trimmed}`);
			}

			return parseInt(trimmed, 10); // Safe to convert after validation
		});
	}

	function addHttps(url) {
		// Check if the URL already starts with 'https://' or 'http://'
		if (!/^https?:\/\//i.test(url)) {
			return "https://" + url;
		}
		return url;
	}

	useEffect(() => {
		if (!isLogin) {
			navigate("/");
		}
	}, []);

	function goBackHandler() {
		navigate(-1);
	}

	if (isClient) {
		return (
			<ReturnHome message="You need to login as an admin to access this page!" />
		);
	}

	function generateDateOneYearFromNow() {
		// Get the current date and time
		const now = new Date();

		// Calculate the date one year from now
		const oneYearFromNow = new Date(now.setFullYear(now.getFullYear() + 1));

		// Format the date to 'YYYY-MM-DDTHH:MM:SSZ'
		const year = oneYearFromNow.getUTCFullYear();
		const month = String(oneYearFromNow.getUTCMonth() + 1).padStart(2, "0");
		const day = String(oneYearFromNow.getUTCDate()).padStart(2, "0");
		const hours = "23";
		const minutes = "59";
		const seconds = "59";

		return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
	}

	let resource;
	let body;

	async function createUserHandler() {
		const estIdArray = getEstArray(estIdStr);

		if (accountType === 0) {
			resource = "/createClientAccount";
			body = {
				email: email,
				name: enteredName,
				establishmentId: estIdArray,
				establishmentUrl: addHttps(enteredUrl),
				subscribedService: selectedServices,
			};
		} else if (accountType === 1) {
			resource = "/createAdmin";
			body = {
				email: email,
				name: enteredName,
				permissionSet: selectedPermission,
			};
		}

		setIsLoading(true);
		const headers = {
			Authorization: `Bearer ${accessToken}`, // Token added in headers
			"Content-Type": "application/json",
		};
		try {
			const res = await axios.post(
				`${BASE_URL}/api/v1/admin${resource}`,
				body,
				{ headers }
			);

			if (res) {
				alert("New user created");
			}
		} catch (e) {
			alert(e.message);
			return;
		} finally {
			setIsLoading(false);
			setUpdateData(Date.now());
		}
	}

	return (
		<div className="py-6 bg-white ">
			<div className=" mx-auto  ">
				<div className="max-w-lg mx-auto">
					<div className="overflow-hidden  rounded-xl">
						<div className="px-4 pt-5 ">
							<div className="max-w-2xl mx-auto text-center">
								<h2 className="text-2xl font-semibold leading-tight text-black ">
									Add/Edit a Client
								</h2>
							</div>

							{/* <AccountTypeSelector /> */}

							<div className="relative max-w-md  mx-auto mt-2">
								<div className="overflow-hidden bg-white ">
									<div className="px-2 py-6 sm:px-8 sm:py-7 ">
										<div>
											<div className="space-y-5 w-[350px]">
												<div>
													<div className=" relative text-gray-400 focus-within:text-gray-600">
														<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
															{/* <div className="w-5 h-5"></div> */}
															<User className="h-5 w-5" />
														</div>

														<input
															onChange={(e) => setEnteredName(e.target.value)}
															type="text"
															value={enteredName}
															id="name"
															placeholder="user name or title"
															className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
														/>
													</div>
												</div>
												{accountType === 0 && (
													<div>
														<div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
															<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
																<Link1 className="h-5 w-5" />
															</div>

															<input
																onChange={(e) => setEnteredUrl(e.target.value)}
																type="text"
																value={enteredUrl}
																id="url"
																placeholder="Enter users Revel url"
																className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
															/>
														</div>
													</div>
												)}
												{accountType === 0 && (
													<div>
														<div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
															<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
																<TagUser className="h-5 w-5" />
															</div>

															<input
																onChange={(e) => setEstIdStr(e.target.value)}
																type="text"
																value={estIdStr}
																id="estid"
																placeholder="Enter Establishment ids. e.g: 12,39,20"
																className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
															/>
														</div>
													</div>
												)}
												<div>
													<div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
														<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
																	d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
																/>
															</svg>
														</div>

														<input
															onChange={(e) => setEmail(e.target.value)}
															type="email"
															value={email}
															id="email"
															placeholder="Enter users email"
															className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
														/>
													</div>
												</div>

												{accountType === 0 && (
													<SelectClientServices
														allServices={allServices}
														setSelectedServices={setSelectedServices}
														selectedServices={selectedServices}
													/>
												)}

												{accountType === 1 && (
													<div>
														<SelectPermissions
															permissions={permissions}
															setPermissions={setPermissions}
														/>
													</div>
												)}

												<div>
													<Button isLoading={isLoading} onClick={createUserH}>
														Create {accountType === 0 && "Client"}{" "}
														{accountType === 1 && "User"}
													</Button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
