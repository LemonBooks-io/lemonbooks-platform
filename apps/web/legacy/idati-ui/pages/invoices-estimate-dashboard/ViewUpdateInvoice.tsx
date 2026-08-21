import axios from "axios";
import { Send2 } from "iconsax-react";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Button from "../../components/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";
import { v4 as uuidv4 } from "uuid";
import SelectComponent from "./SelectComponent";
import { getRequest, postRequest } from "../../utils/fetch-function";
import SelectItem from "./SelectItem";

export default function ViewUpdateInvoice({ type }) {
	const itemInit = {
		amount: "", //rate of each item
		currency: "KWD",
		name: "",
		description: "",
		quantity: "",
		// discount: { discountAmt: "0.00" },
	};

	const {
		setRefresh,
		allClients,
		setAllClients,
		updateData,
		setIsFetching,
		isFetching,
		accessToken,
		setAllServices,
		setItems,
		items,
		userProfile,
		selectedInvoice,
		setSelectedInvoice,
		allItems,
		setAllItems,
	} = useStates();

	const [isLoading, setIsLoading] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [nextInvoiceNo, setNextInvoiceNo] = useState("");
	const navigate = useNavigate();

	const invoiceType = useLocation().pathname.split("/")[1];

	useEffect(() => {
		async function fetchClients() {
			try {
				setIsFetching(true);

				const res = await getRequest(
					"client/management/getClients",
					"offset=1&limit=20",
					accessToken
				);

				if (res) {
					setAllClients(res?.data);
				}
			} catch (error) {
				console.error("Error fetching services:", error);
				throw error; // Re-throw for error handling upstream
			} finally {
				setIsFetching(false);
			}
		}
		fetchClients();

		async function fetchItems() {
			try {
				setIsFetching(true);

				const res = await getRequest(
					"items/getItems",
					"offset=1&limit=20",
					accessToken
				);

				if (res) {
					setItems(res);
				}
			} catch (error) {
				console.error("Error fetching services:", error);
				throw error; // Re-throw for error handling upstream
			} finally {
				setIsFetching(false);
			}
		}
		fetchItems();

		async function fetchNo() {
			try {
				setIsFetching(true);

				const res = await getRequest(
					"invoices/getNextInvoiceNumber",
					"invoiceType=" + invoiceType,
					accessToken
				);

				if (res) {
					setNextInvoiceNo(res?.nextInvoiceNumber);
				}
			} catch (error) {
				console.error("Error fetching services:", error);
				throw error; // Re-throw for error handling upstream
			} finally {
				setIsFetching(false);
			}
		}

		fetchNo();

		async function fetchServices() {
			try {
				setIsFetching(true);
				const res = await getRequest(
					"services/all",
					"offset=1&limit=20",
					accessToken
				);

				if (res) {
					setAllServices(res?.services);
				}
			} catch (error) {
				console.error("Error fetching services:", error);
				throw error; // Re-throw for error handling upstream
			} finally {
				setIsFetching(false);
			}
		}
		fetchServices();
	}, [updateData]);

	const [eachItem, setEachItem] = useState(itemInit);
	const [total, setTotal] = useState(0);

	const [selectedItem, setSelectedItem] = useState(null);
	const [dueDate, setDueDate] = useState(
		new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
	);
	const [expiryDate, setExpiryDate] = useState(
		new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
	);

	const createData = {
		draft: type === "Estimate",
		due: utcDateToTimestamp(dueDate),
		expiry: utcDateToTimestamp(expiryDate),
		description: `${type} for your order`,

		note: `The following is the ${type} for your order`,

		charge: {
			receipt: {
				email: true,
				sms: true,
			},
		},
		customer: {
			first_name: selectedCustomer?.first_name,
			last_name: selectedCustomer?.last_name,
			email: selectedCustomer?.email,
			phone: selectedCustomer?.phone,
		},
		statement_descriptor: `${type} for order made`,
		order: {
			amount: total,
			items: allItems,
			currency: "KWD",
		},
	};

	function calculateTotal(item) {
		if (item?.amount !== "" && item?.quantity !== "") {
			setTotal((cur) => cur + Number(item.amount) * Number(item.quantity));
		}
	}

	function handleAddItem() {
		const newItem = {
			...eachItem,
			name: selectedItem?.itemName,
			description: selectedItem?.description,
		};
		setAllItems((prevItems) => [...prevItems, newItem]);
		calculateTotal(newItem);
		setEachItem(itemInit);
		setSelectedItem(null);
	}

	function handleRemoveItem(index) {
		setAllItems((prevItems) => {
			// Get the item to be removed
			const itemToRemove = prevItems[index];

			// Update the total by subtracting the item's value
			if (itemToRemove?.amount && itemToRemove?.quantity) {
				setTotal(
					(cur) =>
						cur - Number(itemToRemove.amount) * Number(itemToRemove.quantity)
				);
			}

			// Remove the item from the list
			return prevItems.filter((_, itemIndex) => itemIndex !== index);
		});
	}

	const handleChange = (e) => {
		const { name, value } = e.target;

		// Update the state with the new value

		if (name === "discount") {
			setEachItem((prevItem) => ({
				...prevItem,
				[name]: { discountAmt: value },
			}));
		} else {
			setEachItem((prevItem) => ({
				...prevItem,
				[name]: value,
			}));
		}
	};

	function utcDateToTimestamp(dateStr) {
		if (!dateStr) {
			return;
		}
		const now = new Date();

		const nowTime = `T${now.toISOString().split("T")[1]}`;
		const combinedStr = `${dateStr}${nowTime}`;
		const combinedTime = new Date(combinedStr);

		const isoString = combinedTime.toISOString();
		return new Date(isoString).getTime();
	}

	async function handleCreate() {
		try {
			setIsLoading(true);
			// Make a POST request without the Authorization header
			const response = await postRequest(
				"invoices/createInvoice",
				createData,
				accessToken
			);

			alert(type + " Created Sucessfully");
			// Handle successful response, e.g., show success message or reset form
		} catch (err) {
			alert(err.message);
			console.error(
				"Error creating invoice:",
				err.response ? err.response.data : err.message
			);
			return;
		} finally {
			setIsLoading(false);
			navigate(-1);

			setTimeout(() => {
				setRefresh(uuidv4()); // Navigate after 2 seconds
			}, 1000);
		}
	}

	return (
		<section className="py-12 bg-white sm:py-16 lg:py-20">
			<div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
				<div className="max-w-6xl mx-auto">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							{type} {selectedInvoice?.invoiceNumber}{" "}
						</h1>
					</div>

					<div className="grid grid-cols-1 mt-8 lg:grid-cols-5 lg:items-start xl:grid-cols-6 gap-y-10 lg:gap-x-12 xl:gap-x-16">
						{selectedInvoice?.order?.items?.length > 0 && (
							<div className="lg:sticky lg:order-2 lg:top-6 lg:col-span-2">
								<div className="overflow-hidden rounded bg-gray-50">
									<div className="px-4 py-6 sm:p-6 lg:p-8">
										<h3 className="text-xl font-bold text-gray-900">
											{type} Items
										</h3>

										<div className="flow-root mt-8">
											<ul className="divide-y divide-gray-200 -my-7">
												{selectedInvoice?.order?.items?.map((item, index) => (
													<li
														key={index}
														className="flex items-stretch justify-between space-x-5 py-7"
													>
														<div className="flex flex-col justify-between flex-1 ml-5">
															<div className="flex-1">
																<p className="text-base font-bold text-gray-900">
																	{item.name}{" "}
																	{/* Assuming 'name' is a property of the item */}
																</p>

																<p className="mt-1 text-sm font-medium text-gray-500">
																	{item.description}{" "}
																	{/* Assuming 'description' is a property of the item */}
																</p>

																<div className="flex justify-between mt-3">
																	<p className="text-sm font-medium text-gray-700">
																		Qty: {item.quantity}{" "}
																		{/* Assuming 'quantity' is a property of the item */}
																	</p>
																	<p className="text-sm font-medium text-gray-700">
																		Rate: {item.amount} KWD{" "}
																		{/* Assuming 'rate' is a property of the item */}
																	</p>
																</div>
															</div>
															<p className="mt-2 text-md font-bold text-gray-900">
																{Number(item.amount) * Number(item.quantity)}{" "}
																KWD{" "}
																{/* Assuming 'total' is a property of the item */}
															</p>
														</div>

														<div className="ml-auto">
															<button
																onClick={() => handleRemoveItem(index)}
																type="button"
																className="inline-flex p-2 -m-2 text-gray-400 transition-all duration-200 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:text-gray-900"
															>
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
															</button>
														</div>
													</li>
												))}
											</ul>
										</div>

										<hr className="mt-6 border-gray-200" />

										<div className="flow-root mt-5">
											<div className="-my-5 divide-y divide-gray-200">
												<div className="flex items-center justify-between py-5">
													<p className="text-sm font-medium text-gray-600">
														Subtotal
													</p>
													<p className="text-sm font-medium text-right text-gray-600">
														{selectedInvoice?.order?.amount} KWD{" "}
													</p>
												</div>

												<div className="flex items-center justify-between py-5">
													<p className="text-sm font-medium text-gray-600">
														Tax
													</p>
													<p className="text-sm font-medium text-right text-gray-600">
														0 KWD
													</p>
												</div>

												<div className="flex items-center justify-between py-5">
													<p className="text-sm font-medium text-gray-600">
														Shipping
													</p>
													<p className="text-sm font-medium text-right text-gray-600">
														0 KWD
													</p>
												</div>

												<div className="flex items-center justify-between py-5">
													<p className="text-sm font-bold text-gray-900">
														Total
													</p>
													<p className="text-md font-bold text-right text-gray-900">
														{selectedInvoice?.order?.amount} KWD{" "}
													</p>
												</div>
											</div>
										</div>

										<div className="mt-6">
											<Button
												isLoading={isLoading}
												message={`Creating Client...`}
												onClick={handleCreate}
											>
												<Send2 />
												Create & Send {type}
											</Button>
										</div>
									</div>
								</div>
							</div>
						)}

						<div className="pt-6 border-t border-gray-200 lg:order-1 lg:col-span-3 xl:col-span-4">
							{/* <SelectComponent
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                data={allClients}
                description="Select Client or Customer"
                handleChange={handleChange}
              /> */}
							<div className="flow-root">
								<div className="divide-y divide-gray-200 -my-7">
									{selectedInvoice && (
										<div className="py-7">
											<h2 className="text-base font-bold text-gray-900">
												Customer Information
											</h2>

											<div className="grid grid-cols-1 mt-6 sm:grid-cols-2 gap-y-5 gap-x-6">
												<div className="grid grid-cols-2 col-span-2 w-full gap-x-6 ">
													<div className=" col-span-1  ">
														<label className="text-sm font-medium text-gray-600">
															{" "}
															First Name
														</label>
														<div className="mt-2">
															<div className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
																{selectedInvoice?.customer?.first_name}
															</div>
														</div>
													</div>

													<div className=" col-span-1  ">
														<label className="text-sm font-medium text-gray-600">
															{" "}
															Last Name
														</label>
														<div className="mt-2">
															<div className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
																{selectedInvoice?.customer?.last_name}
															</div>
														</div>
													</div>
												</div>

												{selectedCustomer?.company && (
													<div className="col-span-2">
														<label className="text-sm font-medium text-gray-600">
															{" "}
															Company
														</label>
														<div className="mt-2">
															<div className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
																{selectedCustomer?.company}
															</div>
														</div>
													</div>
												)}

												<div className="col-span-2">
													<label className="text-sm font-medium text-gray-600">
														{" "}
														Phone number{" "}
													</label>

													<div className="flex gap-2  ">
														<div className="border-2    w-[120px] mt-2  items-center flex p-2 rounded-md">
															{" "}
															<PhoneInput
																readOnly
																className="w-[85px] "
																international
																name="country_code"
																// defaultCountry="KW"
																value={
																	selectedInvoice?.customer?.phone?.country_code
																}
															/>
														</div>
														<div className="mt-2 w-full">
															<div className="flex   w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
																{selectedInvoice?.customer?.phone?.number}
															</div>
														</div>
													</div>
												</div>

												<div className="col-span-2">
													<label className="text-sm font-medium text-gray-600">
														{" "}
														Email{" "}
													</label>
													<div className="mt-2">
														<div className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
															{selectedInvoice?.customer?.email}
														</div>
													</div>
												</div>
											</div>
										</div>
									)}

									{selectedInvoice && (
										<div className="py-7">
											<h2 className="text-base font-bold text-gray-900">
												{type} Information
											</h2>

											<div className="grid grid-cols-1 mt-6 sm:grid-cols-2 gap-y-5 gap-x-6">
												<div className="grid grid-cols-2 col-span-2 w-full gap-x-6 ">
													<div className=" col-span-1  ">
														<label className="text-sm font-medium text-gray-600">
															{" "}
															{type} No.
														</label>
														<div className="mt-2">
															<div className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
																{selectedInvoice?.invoiceNumber}
															</div>
														</div>
													</div>
												</div>

												<div className="grid grid-cols-2 col-span-2 w-full gap-x-6 ">
													<div className="col-span-1">
														<label
															htmlFor="due-date"
															className="text-sm font-medium text-gray-600"
														>
															{type} Date
														</label>
														<div className="mt-2">
															<input
																onChange={(e) => setDueDate(e.target.value)}
																type="date"
																id="invoice-estimate-date"
																name="invoice-estimate-date"
																defaultValue={
																	new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
																		.toISOString()
																		.split("T")[0]
																} // Set today's date as default
																className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
															/>
														</div>
													</div>

													<div className="col-span-1">
														<label
															htmlFor="expiry-date"
															className="text-sm font-medium text-gray-600"
														>
															Expiry Date
														</label>
														<div className="mt-2">
															<input
																onChange={(e) => setExpiryDate(e.target.value)}
																type="date"
																id="expiry-date"
																name="expiry-date"
																defaultValue={
																	new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
																		.toISOString()
																		.split("T")[0]
																} // Set date to a week from today
																className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
															/>
														</div>
													</div>
												</div>

												<div className="sm:col-span-2">
													<label className="text-sm font-medium text-gray-600">
														{" "}
														Prepared By
													</label>
													<div className="mt-2">
														<div className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
															{userProfile?.user?.name}
														</div>
													</div>
												</div>
											</div>
										</div>
									)}

									{selectedInvoice && (
										<div className="py-7">
											<h2 className="text-base font-bold text-gray-900">
												Add Items
											</h2>

											<div className=" bg-white ">
												<div className=" mx-auto max-w-7xl ">
													<div className="flex flex-col mt-4">
														<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
															<div className="inline-block min-w-full py-2  align-middle ">
																<table className="min-w-full lg:divide-gray-200 lg:divide-y">
																	<tbody>
																		<tr className=" items-start flex ">
																			<td className="px-2  py-4 text-sm font-bold text-gray-900 align-top lg:align-middle whitespace-nowrap">
																				<div className="flex items-center">
																					<SelectItem
																						selectedItem={selectedItem}
																						setSelectedItem={setSelectedItem}
																						data={items?.items}
																						description="Select Item"
																						handleChange={handleChange}
																					/>
																				</div>
																				<div className=" space-y-2 font-medium pl-1 lg:hidden">
																					<div className="flex items-center">
																						<input
																							onChange={handleChange}
																							type="number"
																							id=""
																							value={eachItem.quantity}
																							name="quantity"
																							placeholder="Quantity"
																							className="block  max-w-[90px] h-full py-1 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																						/>
																					</div>

																					<div className="flex items-center">
																						<input
																							onChange={handleChange}
																							type="number"
																							id=""
																							name="amount"
																							value={eachItem.amount}
																							placeholder="Rate"
																							className="block  max-w-[90px] px-2 py-1 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																						/>
																					</div>

																					<div className="flex items-center">
																						<input
																							// onChange={handleChange}
																							type="number"
																							id=""
																							// value={
																							//   eachItem.discount.discountAmt
																							// }
																							name="discount"
																							placeholder="Discount"
																							className="block  max-w-[90px] px-2 py-1 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																						/>
																					</div>
																				</div>
																			</td>

																			<td className=" hidden px-2 items-center  py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
																				<div className="flex items-center">
																					{" "}
																					<input
																						onChange={handleChange}
																						type="number"
																						id=""
																						name="quantity"
																						value={eachItem.quantity}
																						placeholder="Quantity"
																						className="block  max-w-[90px] px-2 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																					/>
																				</div>
																			</td>

																			<td className="hidden px-2 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
																				<div className="flex items-center">
																					<input
																						onChange={handleChange}
																						type="number"
																						id=""
																						name="amount"
																						value={eachItem.amount}
																						placeholder="Rate"
																						className="block  max-w-[90px] px-2 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																					/>
																				</div>
																			</td>

																			<td className="hidden px-2 py-4 text-sm font-medium text-gray-900 xl:table-cell whitespace-nowrap">
																				<div className=" flex items-center">
																					<input
																						// onChange={handleChange}
																						type="number"
																						id=""
																						// value={eachItem.discount.discountAmt}
																						name="discount"
																						placeholder="Discount"
																						className="block  max-w-[90px] px-2 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																					/>
																				</div>
																			</td>

																			<td className="px-2  py-4 text-sm font-medium text-right text-gray-900 align-top lg:align-middle lg:text-left whitespace-nowrap">
																				<div className="flex justify-end">
																					{" "}
																					<input
																						type="number"
																						id=""
																						name=""
																						placeholder="Tax"
																						className="block  max-w-[90px] px-2 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																					/>
																				</div>
																				<div className="  mt-10 font-bold lg:hidden">
																					{eachItem?.amount !== "" &&
																					eachItem?.quantity !== ""
																						? Number(eachItem.amount) *
																						  Number(eachItem.quantity)
																						: 0}{" "}
																					KWD
																				</div>
																			</td>

																			<td className="hidden lg:block  px-2  mt-3  py-4 text-sm font-medium text-right text-gray-900 align-top lg:align-middle lg:text-left whitespace-nowrap">
																				<div className="flex justify-end">
																					{" "}
																					{eachItem?.amount !== "" &&
																					eachItem?.quantity !== ""
																						? Number(eachItem.amount) *
																						  Number(eachItem.quantity)
																						: 0}{" "}
																					KWD
																				</div>
																			</td>
																		</tr>
																	</tbody>
																</table>

																<div className="grid grid-cols-1 lg:grid-cols-4  w-full gap-x-6 px-4 ">
																	{selectedItem && (
																		<div className=" col-span-1  lg:col-span-3  ">
																			<label className="text-sm font-medium text-gray-600">
																				{" "}
																				Additional Details
																			</label>
																			<div className="mt-2">
																				<div className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
																					{selectedItem?.description}
																				</div>
																			</div>
																		</div>
																	)}

																	<div className=" col-span-1  flex items-center justify-center lg:items-end  ">
																		{/* <div className="mt-2  w-full">
                                   <input
                                     type="text"
                                     id=""
                                     name=""
                                     placeholder=""
                                     className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
                                   />
                                 </div> */}
																		{eachItem.amount &&
																			eachItem.quantity &&
																			selectedItem && (
																				<button
																					onClick={handleAddItem}
																					type="button"
																					className={`inline-flex items-center justify-center w-full px-4 mt-4 lg:mt-0 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-lg  hover:bg-indigo-500`}
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
																					Add Item
																				</button>
																			)}
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
