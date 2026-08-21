import axios from "axios";
import { Send2 } from "iconsax-react";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Button from "../../components/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";
import { v4 as uuidv4 } from "uuid";
import SelectClientServices from "../add-user-client/SelectClientServices";
import { getRequest, postRequest } from "../../utils/fetch-function";

export default function CreateEditUser({ attribute }) {
	const {
		selectedClient,
		allClients,
		tenant,
		userProfile,
		path,
		setSelectedClient,
		predefinedServices,
		allUsers,
		toast,
		setSelectedUser,
	} = useStates();

	const navigate = useNavigate();
	const [selectedServices, setSelectedServices] = useState([]);

	const [isLoading, setIsLoading] = useState(false);

	const [estIdStr, setEstIdStr] = useState("");

	const [clientCreateBody, setClientCreateBody] = useState({
		firstName: "",
		lastName: "",
		phone: {
			countryCode: "+965",
			number: "",
		},
		company: "",
		email: "",

		address: "",
	});

	const { id } = useParams();
	useEffect(() => {
		if (id && allUsers) {
			const selected = allUsers?.users?.find((client) => client?.id === id);

			setSelectedClient(selected);
		}
	}, [id, allUsers]);

	useEffect(() => {
		if (selectedClient && id) {
			setClientCreateBody(selectedClient);
		}
	}, [selectedClient, path]);

	function addHttps(url) {
		// Check if the URL already starts with 'https://' or 'http://'
		if (!/^https?:\/\//i.test(url)) {
			return "https://" + url;
		}
		return url;
	}

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

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === "establishmentUrl") {
			setClientCreateBody((prevItem) => ({
				...prevItem,
				[name]: addHttps(value),
			}));
		} else if (name === "establishmentId") {
			setClientCreateBody((prevItem) => ({
				...prevItem,
			}));
		} else if (name === "country_code" || name === "number") {
			setClientCreateBody((prevItem) => ({
				...prevItem,
				phone: {
					...prevItem.phone,
					[name]: value,
				},
			}));
		} else {
			setClientCreateBody((prevItem) => ({
				...prevItem,
				[name]: value,
			}));
		}
	};

	async function createClientHandler() {
		const estIdArray = getEstArray(estIdStr);

		const userCreateBody = {
			name: `${clientCreateBody.firstName} ${clientCreateBody?.lastName}`,
			email: clientCreateBody?.email,
			role: "User",

			permissionSet: [],
		};

		setIsLoading(true);

		const res = await postRequest(
			"user/create",
			userCreateBody,
			userProfile?.accessToken,
			tenant
		);

		if (res) {
			toast.success(res?.message);

			navigate(-1);
		}
		setIsLoading(false);
		// setUpdateData(Date.now());
	}

	return (
		<section className="py-12 bg-white sm:py-16 lg:py-20">
			<div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
				<div className="max-w-6xl mx-auto">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							{attribute?.header}
							{/* Add new user */}
						</h1>
					</div>

					<div className="grid grid-cols-1 mt-8 lg:grid-cols-5 lg:items-start xl:grid-cols-6 gap-y-10 lg:gap-x-12 xl:gap-x-16">
						<div className="pt-6  border-t border-gray-200 lg:order-1 lg:col-span-5 xl:col-span-6">
							<div className="flow-root">
								<div className="divide-y divide-gray-200 -my-7">
									<div className="py-7">
										<h2 className="text-base font-bold text-gray-900">
											User Information
										</h2>

										<div className="grid grid-cols-1 mt-6 sm:grid-cols-2 gap-y-5 gap-x-6">
											<div className="grid sm:grid-cols-2 col-span-2 w-full gap-x-6 ">
												<div className=" col-span-1  ">
													<label className="text-sm font-medium text-gray-600">
														{" "}
														First Name
													</label>
													<div className="mt-2">
														<input
															onChange={handleChange}
															value={
																clientCreateBody?.firstName ||
																clientCreateBody?.name?.split(" ")[0] ||
																""
															}
															type="text"
															id=""
															name="firstName"
															placeholder=""
															className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
														/>
													</div>
												</div>

												<div className=" col-span-1  ">
													<label className="text-sm font-medium text-gray-600">
														{" "}
														Last Name
													</label>
													<div className="mt-2">
														<input
															onChange={handleChange}
															value={
																clientCreateBody?.lastName ||
																clientCreateBody?.name?.split(" ")[1] ||
																""
															}
															type="text"
															id=""
															name="lastName"
															placeholder=""
															className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
														/>
													</div>
												</div>
											</div>

											<div className="col-span-2">
												<label className="text-sm font-medium text-gray-600">
													{" "}
													Email{" "}
												</label>
												<div className="mt-2">
													<input
														onChange={handleChange}
														type="email"
														value={clientCreateBody?.email || ""}
														id="email"
														name="email"
														placeholder=""
														className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
													/>
												</div>
											</div>

											<div className="col-span-2">
												<Button
													isLoading={isLoading}
													message={`Creating Client...`}
													onClick={createClientHandler}
												>
													{attribute?.buttonDescription}
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
		</section>
	);
}
