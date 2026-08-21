/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import "react-phone-number-input/style.css";
import Button from "../../components/Button";
import { useStates } from "../../contexts/StatesContext";
import { patchRequest } from "../../utils/fetch-function";
import { useNavigate, useParams } from "react-router-dom";

// eslint-disable-next-line no-unused-vars
export default function UpdateProduct({ attribute }) {
	const {
		tenant,
		userProfile,
		toast,
		triggerUpdate,
		businessInfo,
		selectedProduct,
		productsAndServices,
		setSelectedProduct,
		path,
	} = useStates();

	const initBody = {
		name: "",
		cost: "",
		description: "",
		billingCycle: { unit: 1, duration: "MONTH" },
		serviceCycle: { unit: 1, duration: "MONTH" },
		categoryId: "",
		type: "PRODUCT",
	};
	const [productServiceBody, setProductServiceBody] = useState(initBody);

	const [isLoading, setIsLoading] = useState(false);

	const { id } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		if (id && productsAndServices) {
			const selected = productsAndServices?.offerings.find(
				(client) => client?.id === id
			);

			setSelectedProduct(selected);
		}
	}, [id, productsAndServices, setSelectedProduct]);

	useEffect(() => {
		if (selectedProduct && id) {
			setProductServiceBody(selectedProduct);
		}
	}, [selectedProduct, path, id]);

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === "serviceCycle" || name === "billingCycle") {
			setProductServiceBody((prevItem) => ({
				...prevItem,
				[name]: { ...prevItem[name], duration: value },
			}));
		} else {
			setProductServiceBody((prevItem) => ({
				...prevItem,
				[name]: value,
			}));
		}
	};

	async function createClientHandler() {
		setIsLoading(true);
		let res;

		const {
			type,
			serviceCycle,
			billingCycle,
			id,
			currency,
			businessId,
			createdBy,
			...requestBody
		} = productServiceBody;

		res = await patchRequest(
			`offerings/${id}`,
			requestBody,
			userProfile?.accessToken,
			tenant
		);

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
								`(${i + 1}) ${record?.name} ${record?.description} (${
									record?.type
								})`
						)
						.join("\n");
			}

			toast.success(`${res?.message} \n ${failureDetails}`);

			triggerUpdate();

			navigate(-1);
		}

		setIsLoading(false);

		triggerUpdate();
	}

	return (
		<section className="py-12 bg-white sm:py-16 lg:py-20">
			<div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
				<div className="max-w-6xl mx-auto">
					<div className="flex  items-center justify-between flex-wrap gap-2">
						<h1 className="text-2xl font-bold text-gray-900 ">Edit Details</h1>
					</div>

					<div className="grid grid-cols-1 mt-8 lg:grid-cols-5 lg:items-start xl:grid-cols-6 gap-y-10 lg:gap-x-12 xl:gap-x-16">
						<div className="pt-6 border-gray-200 lg:order-1 lg:col-span-5 xl:col-span-6">
							<div className="flow-root">
								<div className="divide-y divide-gray-200 -my-7">
									<div className="py-7">
										<h2 className="text-base font-bold text-gray-900">
											Product/Service Details
										</h2>

										<div className="grid grid-cols-1 mt-6 sm:grid-cols-2 gap-y-5 gap-x-6">
											<>
												{" "}
												<div className="grid sm:grid-cols-3 col-span-3 w-full gap-x-6 ">
													<div className=" col-span-2 sm:col-span-1 ">
														<label className="text-sm font-medium text-gray-600">
															Name
														</label>
														<div className="mt-2">
															<input
																onChange={handleChange}
																value={productServiceBody?.name || ""}
																disabled={isLoading}
																type="text"
																id=""
																name="name"
																placeholder=""
																className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
															/>
														</div>
													</div>

													<div className=" col-span-2  ">
														<label className="text-sm font-medium text-gray-600">
															Description
														</label>
														<div className="mt-2">
															<input
																onChange={handleChange}
																value={productServiceBody?.description || ""}
																disabled={isLoading}
																type="text"
																id=""
																name="description"
																placeholder=""
																className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
															/>
														</div>
													</div>
												</div>
												<div className="grid sm:grid-cols-3 col-span-3 w-full gap-x-6 ">
													<div className=" col-span-1 ">
														<label className="text-sm font-medium text-gray-600">
															Cost
														</label>

														<div className="flex gap-2">
															<div className="relative w-[100px] mt-2">
																{" "}
																<div className="block w-full px-4 py-[9px]  pr-8 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-300 rounded-md  focus:outline-none focus:border-blue-600 appearance-none">
																	{businessInfo?.currency}
																</div>
															</div>

															<div className="mt-2 w-full">
																<input
																	onChange={handleChange}
																	type="text"
																	id=""
																	value={productServiceBody?.cost || ""}
																	disabled={isLoading}
																	name="cost"
																	placeholder="Enter cost"
																	className="flex   w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 disabled:cursor-not-allowed disabled:bg-gray-300 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																/>
															</div>
														</div>
													</div>
												</div>
											</>

											<div className="col-span-3 ">
												<Button
													isLoading={isLoading}
													message={`Saving Changes...`}
													onClick={createClientHandler}
												>
													Save Changes
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
