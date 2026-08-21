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
import SelectCategory from "./SelectCategory";
import { getRequest, postRequest } from "../../utils/fetch-function";
import AddMultiple from "./AddMultiple";

export default function AddUpdateItem({ selectedTab }) {
	const {
		isLogin,
		isClient,
		accountType,
		accessToken,
		BASE_URL,
		setUpdateData,
		setIsFetching,
		isFetching,
	} = useStates();
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [enteredCategory, setEnteredCategory] = useState("");

	const [addMultipleItems, setAddMultipleItems] = useState(false);

	const navigate = useNavigate();

	const [addItemBody, setAddItemBody] = useState({
		itemName: "",
		cost: "",
		currency: "KWD",
		description: "",
		categoryName: "",
	});

	const handleItemChange = (e) => {
		const { name, value } = e.target;

		setAddItemBody((prevItem) => ({
			...prevItem,
			[name]: value,
		}));
	};

	useEffect(() => {
		if (!isLogin) {
			navigate("/");
		}
	}, []);

	function goBackHandler() {
		navigate(-1);
	}

	// if (isClient) {
	//   return (
	//     <ReturnHome message="You need to login as an admin to access this page!" />
	//   );
	// }

	async function handleCreateItem() {
		try {
			setIsFetching(true);

			if (selectedTab === "items") {
				await postRequest("items/createItem", addItemBody, accessToken);

				alert("Item has been created ");
			} else if (selectedTab === "categories") {
				await postRequest(
					"categories/createCategory",
					{ categoryName: enteredCategory },
					accessToken
				);

				alert("Category has been created ");
			}
		} catch (e) {
			alert(e.message);
		} finally {
			setIsFetching(false);
			setUpdateData(Date.now());
		}
	}

	const handleFileUpload = (event) => {
		const file = event.target.files[0];
		if (file) {
		}
	};

	return (
		<div className="py-6 bg-white ">
			<div className=" mx-auto  ">
				<div className="max-w-lg mx-auto ">
					<div className="overflow-hidden  rounded-xl">
						<div className="px-2 pt-5 ">
							<div className="max-w-2xl mx-auto text-center">
								<h2 className="text-2xl font-semibold leading-tight text-black ">
									{selectedTab === "items" &&
										(addMultipleItems
											? "Upload & Add Items"
											: "Add/Edit an Item")}
									{selectedTab === "categories" && "Add/Edit a Category"}
								</h2>
							</div>

							{/* <AccountTypeSelector /> */}

							{selectedTab === "items" && (
								<AddMultiple
									addMultipleItems={addMultipleItems}
									setAddMultipleItems={setAddMultipleItems}
								/>
							)}

							<div className="relative max-w-md  mx-auto mt-2">
								<div className="overflow-hidden bg-white ">
									<div className="px-2 py-6 sm:px-8 sm:py-7 ">
										<div>
											{addMultipleItems && (
												<div className="mb-10 p-4 mt-3  border border-gray-300 rounded-md">
													<label
														htmlFor="excel-upload"
														className="block mb-2 font-bold text-gray-700"
													>
														Upload items list
													</label>
													<input
														type="file"
														id="excel-upload"
														accept=".xlsx, .xls"
														onChange={handleFileUpload}
														className="p-2 border border-gray-300 max-w-[300px] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
													/>
												</div>
											)}
											<div className="space-y-5 w-[350px]">
												{!addMultipleItems && (
													<>
														{" "}
														{selectedTab === "categories" && (
															<div>
																<div className=" relative text-gray-400 focus-within:text-gray-600">
																	<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
																		{/* <div className="w-5 h-5"></div> */}

																		<svg
																			className="h-5 w-5"
																			viewBox="0 0 128 128"
																			fill="none"
																			xmlns="http://www.w3.org/2000/svg"
																		>
																			<path
																				d="M85 53C89.4183 53 93 49.4183 93 45C93 40.5817 89.4183 37 85 37C80.5817 37 77 40.5817 77 45C77 49.4183 80.5817 53 85 53Z"
																				stroke="currentColor"
																				strokeWidth="4"
																				stroke-miterlimit="10"
																				strokeLinecap="round"
																				strokeLinejoin="round"
																			/>
																			<path
																				d="M106.485 62.6379L62.8455 106.136C59.4564 109.514 53.9717 109.51 50.588 106.126L21.5407 77.0785C18.148 73.6858 18.1539 68.1834 21.5538 64.798L65.0096 21.5276C66.6352 19.9088 68.836 19 71.1302 19H100.361C105.152 19 109.035 22.8837 109.035 27.6744V56.4943C109.035 58.7997 108.117 61.0103 106.485 62.6379Z"
																				stroke="currentColor"
																				strokeWidth="4.33719"
																				stroke-miterlimit="10"
																				strokeLinecap="round"
																				strokeLinejoin="round"
																			/>
																		</svg>
																	</div>

																	<input
																		onChange={(e) =>
																			setEnteredCategory(e.target.value)
																		}
																		type="text"
																		value={enteredCategory}
																		id="category"
																		name="category"
																		placeholder="category name"
																		className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
																	/>
																</div>
															</div>
														)}
														{selectedTab === "items" && (
															<>
																<div>
																	<div className=" relative text-gray-400 focus-within:text-gray-600">
																		<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
																			{/* <div className="w-5 h-5"></div> */}

																			<svg
																				className="h-5 w-5"
																				viewBox="0 0 128 128"
																				fill="none"
																				xmlns="http://www.w3.org/2000/svg"
																			>
																				<path
																					d="M85 53C89.4183 53 93 49.4183 93 45C93 40.5817 89.4183 37 85 37C80.5817 37 77 40.5817 77 45C77 49.4183 80.5817 53 85 53Z"
																					stroke="currentColor"
																					strokeWidth="4"
																					stroke-miterlimit="10"
																					strokeLinecap="round"
																					strokeLinejoin="round"
																				/>
																				<path
																					d="M106.485 62.6379L62.8455 106.136C59.4564 109.514 53.9717 109.51 50.588 106.126L21.5407 77.0785C18.148 73.6858 18.1539 68.1834 21.5538 64.798L65.0096 21.5276C66.6352 19.9088 68.836 19 71.1302 19H100.361C105.152 19 109.035 22.8837 109.035 27.6744V56.4943C109.035 58.7997 108.117 61.0103 106.485 62.6379Z"
																					stroke="currentColor"
																					strokeWidth="4.33719"
																					stroke-miterlimit="10"
																					strokeLinecap="round"
																					strokeLinejoin="round"
																				/>
																			</svg>
																		</div>

																		<input
																			onChange={handleItemChange}
																			type="text"
																			value={addItemBody.itemName}
																			id="name"
																			name="itemName"
																			placeholder="Item name"
																			className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
																		/>
																	</div>
																</div>
																<div>
																	<div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
																		<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
																			<svg
																				className="w-5 h-5"
																				viewBox="0 0 128 128"
																				fill="none"
																				xmlns="http://www.w3.org/2000/svg"
																			>
																				<path
																					d="M112.36 98.4543V44.7128C112.36 36.8241 105.368 30.4038 96.7686 30.4038H92.4971V29.5453C92.4971 21.6538 85.5054 15.2363 76.9059 15.2363H71.1474H38.1461H31.2309C22.6339 15.2363 15.6396 21.6538 15.6396 29.5453V83.2866C15.6396 91.1753 22.6341 97.5956 31.2309 97.5956H35.5019V98.4543C35.5019 106.346 42.4964 112.763 51.0934 112.763H58.0086H91.0099H93.9766H96.7684C105.368 112.763 112.36 106.346 112.36 98.4543ZM91.0099 108.079H58.0086H51.0934C45.2991 108.079 40.6044 103.77 40.6044 98.4543V97.5956V92.9116V44.7128C40.6044 39.3971 45.2991 35.0878 51.0934 35.0878H58.0086H87.3949H91.0099H92.4971H96.7684C102.563 35.0878 107.257 39.3971 107.257 44.7128V98.4543C107.257 103.77 102.563 108.079 96.7684 108.079H93.9766H91.0099Z"
																					fill="currentColor"
																				/>
																				<path
																					d="M49.3493 53.7335H89.9328C91.0538 53.7335 91.9616 52.8255 91.9616 51.7045C91.9616 50.5835 91.0538 49.6758 89.9328 49.6758H49.3493C48.2283 49.6758 47.3203 50.5835 47.3203 51.7045C47.3203 52.8255 48.2283 53.7335 49.3493 53.7335Z"
																					fill="currentColor"
																				/>
																				<path
																					d="M55.7617 65.4927C55.7617 66.6137 56.6722 67.5214 57.7932 67.5214H95.823C96.944 67.5214 97.8545 66.6137 97.8545 65.4927C97.8545 64.3717 96.944 63.4609 95.823 63.4609H57.7932C56.6722 63.4609 55.7617 64.3714 55.7617 65.4927Z"
																					fill="currentColor"
																				/>
																				<path
																					d="M87.0208 79.2751C87.0208 78.1541 86.1128 77.2461 84.9918 77.2461H49.3493C48.2283 77.2461 47.3203 78.1541 47.3203 79.2751C47.3203 80.3961 48.2281 81.3066 49.3493 81.3066H84.9918C86.1128 81.3066 87.0208 80.3963 87.0208 79.2751Z"
																					fill="currentColor"
																				/>
																				<path
																					d="M97.8546 93.062C97.8546 91.941 96.9441 91.0332 95.8231 91.0332H62.4226C61.3016 91.0332 60.3936 91.941 60.3936 93.062C60.3936 94.183 61.3013 95.091 62.4226 95.091H95.8231C96.9443 95.091 97.8546 94.183 97.8546 93.062Z"
																					fill="currentColor"
																				/>
																			</svg>
																		</div>

																		<input
																			onChange={handleItemChange}
																			type="email"
																			value={addItemBody.description}
																			id="email"
																			name="description"
																			placeholder="Item description"
																			className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
																		/>
																	</div>
																</div>

																<div>
																	<div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
																		<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
																			<svg
																				className="w-5 h-5"
																				viewBox="0 0 128 128"
																				fill="none"
																				xmlns="http://www.w3.org/2000/svg"
																			>
																				<path
																					d="M112.36 98.4543V44.7128C112.36 36.8241 105.368 30.4038 96.7686 30.4038H92.4971V29.5453C92.4971 21.6538 85.5054 15.2363 76.9059 15.2363H71.1474H38.1461H31.2309C22.6339 15.2363 15.6396 21.6538 15.6396 29.5453V83.2866C15.6396 91.1753 22.6341 97.5956 31.2309 97.5956H35.5019V98.4543C35.5019 106.346 42.4964 112.763 51.0934 112.763H58.0086H91.0099H93.9766H96.7684C105.368 112.763 112.36 106.346 112.36 98.4543ZM91.0099 108.079H58.0086H51.0934C45.2991 108.079 40.6044 103.77 40.6044 98.4543V97.5956V92.9116V44.7128C40.6044 39.3971 45.2991 35.0878 51.0934 35.0878H58.0086H87.3949H91.0099H92.4971H96.7684C102.563 35.0878 107.257 39.3971 107.257 44.7128V98.4543C107.257 103.77 102.563 108.079 96.7684 108.079H93.9766H91.0099Z"
																					fill="currentColor"
																				/>
																				<path
																					d="M49.3493 53.7335H89.9328C91.0538 53.7335 91.9616 52.8255 91.9616 51.7045C91.9616 50.5835 91.0538 49.6758 89.9328 49.6758H49.3493C48.2283 49.6758 47.3203 50.5835 47.3203 51.7045C47.3203 52.8255 48.2283 53.7335 49.3493 53.7335Z"
																					fill="currentColor"
																				/>
																				<path
																					d="M55.7617 65.4927C55.7617 66.6137 56.6722 67.5214 57.7932 67.5214H95.823C96.944 67.5214 97.8545 66.6137 97.8545 65.4927C97.8545 64.3717 96.944 63.4609 95.823 63.4609H57.7932C56.6722 63.4609 55.7617 64.3714 55.7617 65.4927Z"
																					fill="currentColor"
																				/>
																				<path
																					d="M87.0208 79.2751C87.0208 78.1541 86.1128 77.2461 84.9918 77.2461H49.3493C48.2283 77.2461 47.3203 78.1541 47.3203 79.2751C47.3203 80.3961 48.2281 81.3066 49.3493 81.3066H84.9918C86.1128 81.3066 87.0208 80.3963 87.0208 79.2751Z"
																					fill="currentColor"
																				/>
																				<path
																					d="M97.8546 93.062C97.8546 91.941 96.9441 91.0332 95.8231 91.0332H62.4226C61.3016 91.0332 60.3936 91.941 60.3936 93.062C60.3936 94.183 61.3013 95.091 62.4226 95.091H95.8231C96.9443 95.091 97.8546 94.183 97.8546 93.062Z"
																					fill="currentColor"
																				/>
																			</svg>
																		</div>

																		<input
																			onChange={handleItemChange}
																			type="email"
																			value={addItemBody.cost}
																			id="email"
																			name="cost"
																			placeholder="Price of Item"
																			className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
																		/>
																	</div>
																</div>

																<div>
																	{/* <SelectPermissions
                              permissions={permissions}
                              setPermissions={setPermissions}
                            /> */}
																	<SelectCategory
																		handleItemChange={handleItemChange}
																	/>
																</div>
															</>
														)}
													</>
												)}

												<div>
													<Button
														isLoading={isLoading}
														onClick={handleCreateItem}
													>
														{selectedTab === "items" &&
															(addMultipleItems
																? "Add Uploaded Items"
																: "Add/Edit Item")}
														{selectedTab === "categories" &&
															"Add/Edit Category"}
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
