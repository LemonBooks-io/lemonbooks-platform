import React, { useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import { useNavigate } from "react-router-dom";
import SelectCurrency from "../../components/SelectCurrency";
import UploadLogo from "../../components/UploadLogo";
import { putRequest } from "../../utils/fetch-function";
import { encryptKey } from "../../utils/key-encryption";
import axios from "axios";

const actions = {
	currency: {
		id: "currency",
		title: "Set Business Currency",
		inputLabel: "Select Currency",
		buttonLabel: "Set Currency",
		description:
			"Set your business currency. It will be used as the default for all charges and invoices. This is a required business billing portal configuration",
	},
	logo: {
		id: "logo",
		title: "Set Business Logo",
		inputLabel: "Upload Logo (png, jpg)",
		buttonLabel: "Set Business Logo",
		description:
			"Set your business Logo. It will be used as the business logo on all invoices",
	},
	tap: {
		id: "tap",
		title: "Configure Tap Payment Key",
		inputLabel: "Enter Tap Secret Key",
		buttonLabel: "Set Tap Key",
		description:
			"Configure Tap Payment keys here. This allows your customers to settle payments using cards, powered by Tap Payment. If this is not configured, only alternative payment options like bank transfer will be available",
	},
};

export default function OnboardingModal() {
	const {
		onboardingAction,
		setOnboardingAction,
		userProfile,
		setBusinessInfo,
		BASE_URL,
		toast,
	} = useStates();
	const [selectedCurrency, setSelectedCurrency] = useState(null);
	const [logo, setLogo] = useState(null);
	const [key, setKey] = useState("");

	const navigate = useNavigate();

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setLogo(file);
		}
	};

	async function handleSkip() {
		if (onboardingAction === "currency") {
			setOnboardingAction("logo");
		} else if (onboardingAction === "logo") {
			setOnboardingAction("tap");
		} else if (onboardingAction === "tap") {
			const businessDetails = JSON.parse(localStorage.getItem("businessInfo"));
			setBusinessInfo(businessDetails);
		}
	}

	async function handleOnboard() {
		if (onboardingAction === "currency") {
			const res = await putRequest(
				"business/set-default-currency",
				{
					currency: selectedCurrency?.symbol,
				},
				userProfile?.accessToken,
				""
			);

			if (res) {
				let businessDetails = JSON.parse(localStorage.getItem("businessInfo"));
				businessDetails.currency = selectedCurrency?.symbol;

				localStorage.setItem("businessInfo", JSON.stringify(businessDetails));

				setOnboardingAction("logo");
			}
		} else if (onboardingAction === "logo") {
			const formData = new FormData();
			formData.append("image", logo);

			const config = {
				headers: {
					Authorization: `Bearer ${userProfile?.accessToken}`, // Token added in headers
				},
			};

			try {
				const res = await axios.put(
					`${BASE_URL}/api/v2/business/logo-upload`,
					formData,
					config
				);

				if (res) {
					setOnboardingAction("tap");
				}
			} catch (e) {
				toast.error(e?.response?.data?.error);
			}
		} else if (onboardingAction === "tap") {
			if (key?.length === 0) {
				toast.error("Enter a valid key!");
				return;
			}
			const encryptedKey = await encryptKey(key);

			const body = { key: encryptedKey };

			const res = await putRequest(
				"business/add-tap-key",
				body,
				userProfile?.accessToken,
				""
			);

			if (res) {
				const businessDetails = JSON.parse(
					localStorage.getItem("businessInfo")
				);
				setBusinessInfo(businessDetails);
			}
		}
	}
	return (
		<div className="h-screen bg-gray-100">
			<div className="flex items-center justify-center w-full h-full px-4 py-5 sm:p-6">
				<div className="w-full max-w-lg bg-white shadow-lg rounded-xl">
					<div className="px-4 py-5 sm:p-6">
						<p className="text-xl font-bold text-gray-900">
							{actions[onboardingAction]?.title}
						</p>
						<p className="mt-3 text-sm font-medium text-gray-500">
							{actions[onboardingAction]?.description}
						</p>

						<div className="mt-6">
							<div className="space-y-4">
								<div>
									<label className="text-sm font-bold text-gray-900">
										{" "}
										{actions[onboardingAction]?.inputLabel}
									</label>
									<div className="mt-2 relative">
										{onboardingAction === "currency" && (
											<div className="relative z-10">
												<SelectCurrency
													selectedCurrency={selectedCurrency}
													setSelectedCurrency={setSelectedCurrency}
												/>
											</div>
										)}
										{onboardingAction === "logo" && (
											<div className="relative z-10">
												<UploadLogo handleImageUpload={handleImageUpload} />
											</div>
										)}
										{onboardingAction === "tap" && (
											<input
												onChange={(e) => setKey(e.target.value)}
												type="text"
												name=""
												id=""
												placeholder=""
												value={key}
												className="block w-full px-4 py-3 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm caret-indigo-600 mt-2"
											/>
										)}
									</div>
								</div>
							</div>

							<div className="flex items-center justify-end mt-5 space-x-2">
								<button
									onClick={handleOnboard}
									className="inline-flex w-full items-center justify-center px-6 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-md focus:ring-2  hover:bg-indigo-500"
								>
									{actions[onboardingAction]?.buttonLabel}
								</button>

								<button
									onClick={handleSkip}
									className={`inline-flex ${
										onboardingAction === "currency" &&
										"cursor-not-allowed opacity-60"
									} items-center justify-center px-6 py-3 text-sm font-semibold leading-5 text-gray-600 transition-all duration-200 bg-white border border-gray-300 rounded-md  hover:bg-gray-50 hover:text-gray-900`}
								>
									Skip
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
