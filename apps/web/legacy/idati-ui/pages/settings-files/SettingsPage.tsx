import React, { useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import Button from "../../components/Button";
import axios from "axios";
import TabEnabler from "../../components/TabEnabler";
import { Image, KeySquare, Money2 } from "iconsax-react";
import SelectCurrency from "../../components/SelectCurrency";
import UploadLogo from "../../components/UploadLogo";

export default function SettingsPage() {
	const [isUpdateKey, setIsUpdateKey] = useState(false);
	const [isUpdateLogo, setIsUpdateLogo] = useState(false);
	const [isUpdateCurrency, setIsUpdateCurency] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [key, setKey] = useState("");
	const [logo, setLogo] = useState("");
	const [selectedCurrency, setSelectedCurrency] = useState(null);
	const [currency, setCurrency] = useState("");
	const [logoFile, setLogoFile] = useState(null);

	const {
		maskKey,
		encryptKey,
		BASE_URL,
		userProfile,
		toast,
		businessInfo,
		triggerUpdate,
	} = useStates();

	function handleImageUpload(file) {
		setLogoFile(file);
	}

	async function handleUploadLogo() {
		if (!logoFile) {
			toast.error("Please select a logo first!");
			return;
		}

		const formData = new FormData();
		formData.append("image", logoFile);

		const headers = {
			Authorization: `Bearer ${userProfile?.accessToken}`,
			"Content-Type": "multipart/form-data",
		};

		try {
			setIsLoading(true);

			const res = await axios.put(
				`${BASE_URL}/api/v2/business/logo-upload`,
				formData,
				{ headers }
			);

			toast.success("Logo updated successfully!");
			triggerUpdate();
			setIsUpdateLogo(false);
		} catch (e) {
			toast.error(e?.response?.data?.error || "Upload failed");
		} finally {
			setIsLoading(false);
		}
	}

	async function handleUpdateKey() {
		if (key.length === 0) {
			toast.error("Enter a valid key!");
			return;
		}
		const encryptedKey = await encryptKey(key);

		const headers = {
			Authorization: `Bearer ${userProfile?.accessToken}`, // Replace with your token
			// tenantId: tenant,
			"Content-Type": "application/json",
		};
		const body = { key: encryptedKey };

		try {
			setIsLoading(true);
			const res = await axios.put(
				`${BASE_URL}/api/v2/business/add-tap-key`,
				body,
				{
					headers,
				}
			);

			if (res) {
				toast.success(res?.data?.message);
				setIsUpdateKey(false);
			}
		} catch (e) {
			toast.error(e?.response?.data?.error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex flex-col">
			<div className="flex-1">
				<main>
					<div className="py-6">
						<div className="px-4 mx-auto max-w-7xl">
							<div className="max-w-md">
								<h1 className="text-lg font-bold text-gray-900">Settings</h1>
								<p className="mt-2 text-sm font-medium leading-6 text-gray-500">
									Configure all your billing service features, user access, and
									permissions here.
								</p>
							</div>
						</div>

						<div className="px-4 mx-auto mt-8 max-w-7xl">
							<div className="mt-8  bg-white border border-gray-200 rounded-xl">
								<div className="px-4 py-5 sm:p-6">
									<div className="sm:flex sm:items-center sm:justify-between">
										<div>
											<p className="text-base font-bold text-gray-900">
												Default Currency Setting
											</p>
											<p className="mt-1 text-sm font-medium text-gray-500">
												Your business default currency can be updated here.
											</p>
										</div>

										{!isUpdateCurrency ? (
											<div className="mt-4 sm:mt-0">
												<button
													onClick={() => setIsUpdateCurency(true)}
													type="button"
													className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold leading-4 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500"
												>
													Update Currency
												</button>
											</div>
										) : (
											<div
												onClick={() => setIsUpdateCurency(false)}
												className="cursor-pointer"
											>
												{" "}
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
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</div>
										)}
									</div>

									{isUpdateCurrency && (
										<div className="grid grid-cols-1 md:grid-cols-4 pt-5  items-center gap-4">
											<div className="col-span-3 w-full">
												<SelectCurrency
													selectedCurrency={selectedCurrency}
													setSelectedCurrency={setSelectedCurrency}
												/>
											</div>

											<div className="col-span-1">
												{" "}
												<Button
													isLoading={isLoading}
													onClick={handleUpdateKey}
													message="Saving key..."
												>
													Update currency
												</Button>
											</div>
										</div>
									)}

									{!isUpdateCurrency && (
										<div className="flow-root mt-8">
											<div className="-my-5 divide-y divide-gray-100">
												<div className="py-5">
													<div className="flex items-center">
														<div className="relative flex-shrink-0">
															<Money2 className="object-cover w-6 h-6 " />
														</div>

														<div className="ml-4">
															<p className="text-sm font-bold  text-gray-900">
																Default Currency:{" "}
																<span className="pl-4">
																	{businessInfo?.currency}
																</span>
															</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
							<div className="mt-8 overflow-hidden bg-white border border-gray-200 rounded-xl">
								<div className="px-4 py-5 sm:p-6">
									<div className="sm:flex sm:items-center sm:justify-between">
										<div>
											<p className="text-base font-bold text-gray-900">
												Logo Settings
											</p>
											<p className="mt-1 text-sm font-medium text-gray-500">
												Update your business logo here
											</p>
										</div>

										{!isUpdateLogo ? (
											<div className="mt-4 sm:mt-0">
												<button
													onClick={() => setIsUpdateLogo(true)}
													type="button"
													className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold leading-4 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500"
												>
													Update Logo
												</button>
											</div>
										) : (
											<div
												onClick={() => setIsUpdateLogo(false)}
												className="cursor-pointer"
											>
												{" "}
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
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</div>
										)}
									</div>

									{isUpdateLogo && (
										<div className="grid grid-cols-1 md:grid-cols-4 pt-5  items-center gap-4">
											<div className="col-span-3 w-full">
												<UploadLogo handleImageUpload={handleImageUpload} />
											</div>

											<div className="col-span-1">
												{" "}
												<Button
													isLoading={isLoading}
													onClick={handleUploadLogo}
													message="Uploading..."
												>
													Save Logo
												</Button>
											</div>
										</div>
									)}

									{!isUpdateLogo && (
										<div className="flow-root mt-8">
											<div className="-my-5 divide-y divide-gray-100">
												<div className="py-5">
													<div className="flex items-center">
														<div className="relative flex-shrink-0">
															{businessInfo?.logoUrl ? (
																<img
																	className="object-cover w-6 h-6 "
																	src={businessInfo?.logoUrl}
																/>
															) : (
																<Image className="object-cover w-6 h-6 " />
															)}
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
							<div className="mt-8 overflow-hidden bg-white border border-gray-200 rounded-xl">
								<div className="px-4 py-5 sm:p-6">
									<div className="sm:flex sm:items-center sm:justify-between">
										<div>
											<p className="text-base font-bold text-gray-900">
												Tap Payment Key
											</p>
											<p className="mt-1 text-sm font-medium text-gray-500">
												Set up Tap Payments to let customers pay invoices via
												card.
											</p>
										</div>

										{!isUpdateKey ? (
											<div className="mt-4 sm:mt-0">
												<button
													onClick={() => setIsUpdateKey(true)}
													type="button"
													className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold leading-4 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500"
												>
													Update Key
												</button>
											</div>
										) : (
											<div
												onClick={() => setIsUpdateKey(false)}
												className="cursor-pointer"
											>
												{" "}
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
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</div>
										)}
									</div>

									{isUpdateKey && (
										<div className="grid grid-cols-1 md:grid-cols-4 pt-5  items-center gap-4">
											{/* <label className="col-span-4 mt-4 text-sm font-medium text-gray-600">
                    {" "}
                    Tap Payment Secret Key
                </label> */}

											<div className="col-span-3">
												<input
													onChange={(e) => setKey(e.target.value)}
													type="key"
													value={key}
													id="key"
													name="company"
													className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
												/>
											</div>

											<div className="col-span-1">
												{" "}
												<Button
													isLoading={isLoading}
													onClick={handleUpdateKey}
													message="Saving key..."
												>
													Save Key
												</Button>
											</div>
										</div>
									)}

									{!isUpdateKey && (
										<div className="flow-root mt-8">
											<div className="-my-5 divide-y divide-gray-100">
												<div className="py-5">
													<div className="flex items-center">
														<div className="relative flex-shrink-0">
															<KeySquare className="object-cover w-6 h-6 " />
														</div>

														<div className="ml-4">
															<p className="text-sm font-bold  text-gray-900">
																Secret Key:{" "}
																<span className="pl-4">
																	{/* {maskKey(
                                    "sk_test_example_only",
                                    8,
                                    4
                                  )} */}

																	{businessInfo?.tapEncryptedKeys}
																</span>
															</p>
														</div>

														<div className="ml-auto">
															<TabEnabler />
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>

							<div className="mt-8 overflow-hidden bg-white border border-gray-200 rounded-xl">
								<div className="px-4 py-5 sm:p-6">
									<div className="sm:flex sm:items-center sm:justify-between">
										<div>
											<p className="text-base font-bold text-gray-900">
												User and Group permissions
											</p>
											<p className="mt-1 text-sm font-medium text-gray-500">
												Set up users and group permissions here
											</p>
										</div>

										<div className="mt-4 sm:mt-0">
											<button
												type="button"
												className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold leading-4 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500"
											>
												Update Key
											</button>
										</div>
									</div>

									<div className="flow-root mt-8">
										<div className="-my-5 divide-y divide-gray-100">
											<div className="py-5">
												<div className="flex items-center">
													<div className="relative flex-shrink-0">
														<img
															className="object-cover w-10 h-10 rounded-full"
															src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/previews/settings/1/rareblocks-logo.png"
															alt=""
														/>
													</div>

													<div className="ml-4">
														<p className="text-sm font-bold  text-gray-900">
															Secret Key: ****1234
														</p>
														<p className="mt-1 text-sm font-medium text-gray-500">
															3 members
														</p>
													</div>

													<div className="ml-auto">
														<a
															href="#"
															title=""
															className="text-sm font-medium text-gray-400 transition-all duration-200 hover:text-gray-900"
														>
															{" "}
															Leave{" "}
														</a>
													</div>
												</div>
											</div>

											<div className="py-5">
												<div className="flex items-center">
													<div className="relative flex-shrink-0">
														<img
															className="object-cover w-10 h-10 rounded-full"
															src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/previews/settings/1/astrona-logo.png"
															alt=""
														/>
													</div>

													<div className="ml-4">
														<p className="text-sm font-bold text-gray-900">
															Astrona
														</p>
														<p className="mt-1 text-sm font-medium text-gray-500">
															12 members
														</p>
													</div>

													<div className="ml-auto">
														<a
															href="#"
															title=""
															className="text-sm font-medium text-gray-400 transition-all duration-200 hover:text-gray-900"
														>
															{" "}
															Leave{" "}
														</a>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
