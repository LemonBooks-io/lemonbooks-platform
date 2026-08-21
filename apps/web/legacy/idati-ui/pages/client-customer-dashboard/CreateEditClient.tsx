/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Button from "../../components/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";
import {
	patchRequest,
	postMulti,
	postRequest,
} from "../../utils/fetch-function";
import BulkUploadSelector from "../../components/BulkUploadSelector";
import BulkUploadInput from "../../components/BulkUploadInput";

export default function CreateEditClient({ attribute }) {
	const {
		selectedClient,
		allClients,
		tenant,
		userProfile,
		path,
		setSelectedClient,
		toast,
		isBulkUpload,
		bulkUploadData,
	} = useStates();

	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(false);

	const [clientCreateBody, setClientCreateBody] = useState({
		firstName: "",
		lastName: "",
		openBalance: { amount: "", description: "" },
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
		if (id && allClients) {
			const selected = allClients?.customers.find(
				(client) => client?.id === id,
			);

			setSelectedClient(selected);
		}
	}, [id, allClients, setSelectedClient]);

	useEffect(() => {
		if (selectedClient && id) {
			setClientCreateBody(selectedClient);
		}
	}, [selectedClient, path, id]);

	function addHttps(url) {
		// Check if the URL already starts with 'https://' or 'http://'
		if (!/^https?:\/\//i.test(url)) {
			return "https://" + url;
		}
		return url;
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
		} else if (name === "amount" || name === "description") {
			setClientCreateBody((prevItem) => ({
				...prevItem,
				openBalance: {
					...prevItem.openBalance,
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
		setIsLoading(true);

		let res;
		if (isBulkUpload) {
			res = await postMulti(
				"customer/bulk",
				bulkUploadData,
				userProfile?.accessToken,
				tenant,
			);
		} else {
			if (id) {
				// eslint-disable-next-line no-unused-vars
				const { id, createdBy, receivables, ...rest } = clientCreateBody;

				res = await patchRequest(
					`customer/admin-edit/${id}`,
					rest,
					userProfile?.accessToken,
					tenant,
				);
			} else {
				res = await postRequest(
					"customer/create",
					clientCreateBody,
					userProfile?.accessToken,
					tenant,
				);
			}
		}
		if (res) {
			let failureDetails = "";

			const failedCount = res?.data?.failedCount;
			const failedRecords = res?.data?.failedRecords;

			if (failedCount > 0) {
				failureDetails =
					`\n\n${failedCount} entr${
						failedCount === 1 ? "y" : "ies"
					} failed. They include: \n` +
					failedRecords
						.map(
							(record, i) =>
								`(${i + 1}) ${record?.firstName} ${record?.lastName} ${
									record?.email
								}`,
						)
						.join("\n");
			}

			toast.success(`${res?.message} \n ${failureDetails}`);

			navigate(-1);
		}
		setIsLoading(false);
	}

	return (
		<section className="py-12 bg-white sm:py-16 lg:py-20">
			<div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
				<div className="max-w-6xl mx-auto">
					<div className="flex  items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900">
							{attribute?.header}
						</h1>
						<div className="">
							<BulkUploadSelector />
						</div>
					</div>

					<div className="grid grid-cols-1 mt-8 lg:grid-cols-5 lg:items-start xl:grid-cols-6 gap-y-10 lg:gap-x-12 xl:gap-x-16">
						<div className="pt-6  border-t border-gray-200 lg:order-1 lg:col-span-5 xl:col-span-6">
							{isBulkUpload ? (
								<BulkUploadInput templateName={"customer-bulk-template"} />
							) : (
								<div className="flow-root">
									<div className="divide-y divide-gray-200 -my-7">
										<div className="py-4">
											<div className="grid grid-cols-1 mt-6 sm:grid-cols-2 gap-y-3 gap-x-6">
												<div className="grid grid-cols-1 lg:grid-cols-2 col-span-2 w-full gap-x-6 ">
													<div className=" col-span-1  ">
														<label className="text-sm font-medium text-gray-600">
															{" "}
															First Name
														</label>
														<div className="mt-2">
															<input
																onChange={handleChange}
																value={clientCreateBody?.firstName || ""}
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
																value={clientCreateBody?.lastName || ""}
																type="text"
																id=""
																name="lastName"
																placeholder=""
																className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
															/>
														</div>
													</div>
												</div>

												<div className="grid grid-cols-1 lg:grid-cols-2 col-span-2 w-full gap-x-6 ">
													<div className="col-span-1">
														<label className="text-sm font-medium text-gray-600">
															{" "}
															Phone number{" "}
														</label>

														<div className="flex gap-2  ">
															<div className="border-2    w-[120px] mt-2  items-center flex p-2 rounded-md">
																{" "}
																<PhoneInput
																	className="w-[85px]"
																	international
																	name="country_code"
																	defaultCountry="KW"
																	value={
																		clientCreateBody?.phone?.countryCode || ""
																	}
																	onChange={(e) =>
																		handleChange({
																			target: {
																				name: "country_code",
																				value: e,
																			},
																		})
																	}
																/>
															</div>
															<div className="mt-2 w-full">
																<input
																	onChange={handleChange}
																	type="text"
																	id=""
																	value={clientCreateBody?.phone?.number || ""}
																	name="number"
																	placeholder="Enter phone number"
																	className="flex   w-full px-4 py-3 text-sm font-normal text-gray-900 disabled:bg-gray-200 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																/>
															</div>
														</div>
													</div>

													<div className="col-span-1">
														<label className="text-sm font-medium text-gray-600">
															{" "}
															Email{" "}
														</label>
														<div className="mt-2">
															<input
																onChange={handleChange}
																type="email"
																value={clientCreateBody?.email || ""}
																// disabled={
																// 	attribute.header === "Edit Selected Client"
																// }
																id="email"
																name="email"
																placeholder=""
																className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 disabled:bg-gray-200 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
															/>
														</div>
													</div>
												</div>

												<div className="grid grid-cols-1 lg:grid-cols-3 col-span-2 w-full gap-x-6 ">
													<div className=" col-span-1  ">
														<label className="text-sm font-medium text-gray-600">
															{" "}
															Opening Balance
														</label>
														<div className="mt-2">
															<input
																onChange={handleChange}
																value={
																	clientCreateBody?.openBalance?.amount || ""
																}
																disabled={
																	attribute.header === "Edit Selected Client"
																}
																type="text"
																id=""
																name="amount"
																placeholder=""
																className="block w-full px-4 py-3 text-sm font-normal disabled:bg-gray-200 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
															/>
														</div>
													</div>

													<div className=" col-span-1 lg:col-span-2  ">
														<label className="text-sm font-medium text-gray-600">
															{" "}
															Description
														</label>
														<div className="mt-2">
															<input
																onChange={handleChange}
																value={
																	clientCreateBody?.openBalance?.description ||
																	""
																}
																type="text"
																id=""
																name="description"
																placeholder=""
																className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
															/>
														</div>
													</div>
												</div>

												<div className="grid grid-cols-1 lg:grid-cols-3 col-span-2 w-full gap-x-6 ">
													<div className="col-span-1">
														<label className="text-sm font-medium text-gray-600">
															{" "}
															Company Name
														</label>
														<div className="mt-2">
															<input
																onChange={handleChange}
																type="company"
																value={clientCreateBody?.company || ""}
																id="company"
																name="company"
																placeholder=""
																className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
															/>
														</div>
													</div>

													<div className="col-span-1 lg:col-span-2">
														<label className="text-sm font-medium text-gray-600">
															{" "}
															Client Address
														</label>
														<div className="mt-2">
															<textarea
																onChange={handleChange}
																type="text"
																value={clientCreateBody.address}
																name="address"
																id="address"
																placeholder=""
																className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
															/>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							)}
							<div className="grid grid-cols-1 mt-6 sm:grid-cols-2 gap-y-5 gap-x-6">
								<div className="col-span-2">
									<Button
										isLoading={isLoading}
										message={`Creating Client...`}
										onClick={createClientHandler}
									>
										{isBulkUpload
											? "Load data and create entries"
											: attribute?.buttonDescription}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
