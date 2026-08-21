/* eslint-disable react/prop-types */
import { useState } from "react";

import "react-phone-number-input/style.css";
import Button from "../../components/Button";

import { useStates } from "../../contexts/StatesContext";

import { postMulti, postRequest } from "../../utils/fetch-function";

import TypeSelect from "./TypeSelect";
import CategorySelect from "./CategorySelect";
import ServiceCycleSelect from "./ServiceCycleSelect";
import BillingCycleSelect from "./BillingCycleSelect";
import ProductCategoryTabs from "./ProductCategoryTabs";
import BulkUploadSelector from "../../components/BulkUploadSelector";
import BulkUploadInput from "../../components/BulkUploadInput";

// eslint-disable-next-line no-unused-vars
export default function CreateProductsServicesAndCategories({ attribute }) {
	const {
		tenant,
		userProfile,
		toast,
		triggerUpdate,
		isBulkUpload,
		bulkUploadData,
		productCategoryTab,
		businessInfo,
	} = useStates();

	const [productServiceBody, setProductServiceBody] = useState({
		name: "",
		cost: "",
		description: "",
		billingCycle: "Monthly",
		serviceCycle: "Monthly",
		categoryId: "",
		type: "PRODUCT",
	});

	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setProductServiceBody((prevItem) => ({
			...prevItem,
			[name]: value,
		}));
	};

	async function createClientHandler() {
		setIsLoading(true);
		let res;
		if (productCategoryTab === "CATEGORY") {
			if (isBulkUpload) {
				res = await postMulti(
					"category/bulk",
					bulkUploadData,
					userProfile?.accessToken,
					tenant
				);
			} else {
				const requestBody = {
					name: productServiceBody?.name,
					description: productServiceBody?.description,
				};

				res = await postRequest(
					"category/create",
					requestBody,
					userProfile?.accessToken,
					tenant
				);
			}
		} else if (productCategoryTab === "PRODUCT") {
			if (isBulkUpload) {
				res = await postMulti(
					"offerings/bulk",
					bulkUploadData,
					userProfile?.accessToken,
					tenant
				);
			} else {
				if (productServiceBody?.type === "SERVICE") {
					const { type, ...requestBody } = productServiceBody;

					res = await postRequest(
						`offerings/create?type=${type}`,
						requestBody,
						userProfile?.accessToken,
						tenant
					);

					if (res) {
						setProductServiceBody({
							name: "",
							cost: "",
							currency: "KWD",
							description: "",
							billingCycle: "Monthly",
							serviceCycle: "Monthly",
							categoryId: "",
							type: "PRODUCT",
						});
					}
				} else if (productServiceBody?.type === "PRODUCT") {
					// eslint-disable-next-line no-unused-vars
					const { type, serviceCycle, billingCycle, ...requestBody } =
						productServiceBody;

					res = await postRequest(
						`offerings/create?type=${type}`,
						requestBody,
						userProfile?.accessToken,
						tenant
					);

					if (res) {
						setProductServiceBody({
							name: "",
							cost: "",
							description: "",
							billingCycle: "Monthly",
							serviceCycle: "Monthly",
							categoryId: "",
							type: "PRODUCT",
						});
					}
				}
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
								`(${i + 1}) ${record?.name} ${record?.description} (${
									record?.type
								})`
						)
						.join("\n");
			}

			toast.success(`${res?.message} \n ${failureDetails}`);
		}

		setIsLoading(false);

		triggerUpdate();

		// setUpdateData(Date.now());
	}

	return (
		<section className="py-12 bg-white sm:py-16 lg:py-20">
			<div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
				<div className="max-w-6xl mx-auto">
					<div className="">
						{" "}
						<BulkUploadSelector />
					</div>
					<div className="flex  items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900 ">
							{/* {attribute?.header} */}
							{productCategoryTab === "PRODUCT" && " Create New Product/Sevice"}
							{productCategoryTab === "CATEGORY" && " Create New Category"}
						</h1>{" "}
						<ProductCategoryTabs
							setProductServiceBody={setProductServiceBody}
						/>
					</div>

					<div className="grid grid-cols-1 mt-8 lg:grid-cols-5 lg:items-start xl:grid-cols-6 gap-y-10 lg:gap-x-12 xl:gap-x-16">
						<div className="pt-6  border-t border-gray-200 lg:order-1 lg:col-span-5 xl:col-span-6">
							<div className="flow-root">
								<div className="divide-y divide-gray-200 -my-7">
									<div className="py-7">
										{!isBulkUpload && (
											<h2 className="text-base font-bold text-gray-900">
												{productCategoryTab === "PRODUCT" &&
													" Product/Serivce Details"}

												{productCategoryTab === "CATEGORY" &&
													"Category Details"}
											</h2>
										)}

										<div className="grid grid-cols-1 mt-6 sm:grid-cols-2 gap-y-5 gap-x-6">
											{isBulkUpload ? (
												<BulkUploadInput templateName={"item-bulk-template"} />
											) : (
												<>
													{" "}
													<div className="grid grid-cols-3 col-span-3 w-full gap-x-6 ">
														<div className=" col-span-1  ">
															<label className="text-sm font-medium text-gray-600">
																{" "}
																{productCategoryTab === "PRODUCT" &&
																	"  Product/Service"}
																{productCategoryTab === "CATEGORY" &&
																	"  Category"}{" "}
																Name
															</label>
															<div className="mt-2">
																<input
																	onChange={handleChange}
																	value={productServiceBody?.name || ""}
																	type="text"
																	id=""
																	name="name"
																	placeholder=""
																	className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																/>
															</div>
														</div>

														<div className=" col-span-2  ">
															<label className="text-sm font-medium text-gray-600">
																{" "}
																Description
															</label>
															<div className="mt-2">
																<input
																	onChange={handleChange}
																	value={productServiceBody?.description || ""}
																	type="text"
																	id=""
																	name="description"
																	placeholder=""
																	className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																/>
															</div>
														</div>
													</div>
													{productCategoryTab === "PRODUCT" && (
														<div className="grid grid-cols-3 col-span-3 w-full gap-x-6 ">
															<div className=" col-span-1  ">
																<label className="text-sm font-medium text-gray-600">
																	Select Type
																</label>
																<div className="mt-0">
																	<TypeSelect
																		value={productServiceBody?.type}
																		onChange={handleChange}
																	/>
																</div>
															</div>

															<div className=" col-span-1  ">
																<label className="text-sm font-medium text-gray-600">
																	{" "}
																	Select Category
																</label>
																<div className="mt-0">
																	<CategorySelect
																		onChange={handleChange}
																		value={productServiceBody?.categoryId}
																	/>
																</div>
															</div>
															<div className=" col-span-1 ">
																<label className="text-sm font-medium text-gray-600">
																	{" "}
																	Service/Product Cost
																</label>

																<div className="flex gap-2   ">
																	{/* <CurrencySelect onChange={handleChange} /> */}

																	<div className="relative w-[100px] mt-2   ">
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
																			name="cost"
																			placeholder="Enter cost"
																			className="flex   w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																		/>
																	</div>
																</div>
															</div>
														</div>
													)}
													{productServiceBody?.type === "SERVICE" && (
														<div className="grid grid-cols-2 col-span-2 w-full gap-x-6 ">
															<div className=" col-span-1  ">
																<label className="text-sm font-medium text-gray-600">
																	Service Cycle
																</label>
																<div className="mt-0">
																	<ServiceCycleSelect onChange={handleChange} />
																</div>
															</div>

															<div className=" col-span-1  ">
																<label className="text-sm font-medium text-gray-600">
																	{" "}
																	Default Billing Cycle
																</label>
																<div className="mt-0">
																	<BillingCycleSelect onChange={handleChange} />
																</div>
															</div>
														</div>
													)}
												</>
											)}

											<div className="col-span-3 ">
												<Button
													isLoading={isLoading}
													message={`Creating Client...`}
													onClick={createClientHandler}
												>
													{productCategoryTab === "PRODUCT" &&
														"Create Product/Service Now"}
													{productCategoryTab === "CATEGORY" &&
														"Create Category Now"}
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
