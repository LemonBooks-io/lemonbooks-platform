/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { postRequest } from "../../utils/fetch-function";
import { useStates } from "../../contexts/StatesContext";
import SelectProductService from "./SelectProductService";
import PairedButton from "../../components/PairedButton";
import { useNavigate } from "react-router-dom";

const itemInit = {
	amount: "0", //rate of each item
	name: "",
	description: "",
	quantity: "1",
	discount: "0",
};

export default function ItemsTable({ data, type }) {
	const [isLoading, setIsLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const [selectedItem, setSelectedItem] = useState(null);

	const {
		selectedClient,
		expiryDate,
		toast,
		userProfile,
		triggerUpdate,
		allItems,
		setAllItems,
	} = useStates();

	const navigate = useNavigate();

	const createData = {
		draft: type === "Estimate",
		due: utcDateToTimestamp(
			new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
		),
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
			first_name: selectedClient?.first_name,
			last_name: selectedClient?.last_name,
			email: selectedClient?.email,
			phone: selectedClient?.phone,
		},
		statement_descriptor: `${type} for order made`,
		order: {
			items: allItems,
		},
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

	function handleAddItem() {
		setAllItems((prevItems) => [...prevItems, itemInit]);
		setSelectedItem(null);
	}

	function handleRemoveItem(index) {
		setAllItems((prevItems) => {
			setSelectedItem(null);
			return prevItems.filter((_, itemIndex) => itemIndex !== index);
		});
	}

	function handleChange(index, e) {
		const { name, value } = e.target;

		if (typeof value === "object") {
			setAllItems((prevItems) => {
				// Create a new list of items with the updated item
				const updatedItems = [...prevItems];
				updatedItems[index] = {
					...updatedItems[index],
					amount: value?.cost,
					itemId: value?.id,
					name: value?.name,
					description: value?.description,
					discount: value?.discount,
				};

				setSelectedItem(null);

				return updatedItems; // Return the updated list
			});
		} else {
			setAllItems((prevItems) => {
				// Create a new list of items with the updated item
				const updatedItems = [...prevItems];
				updatedItems[index] = { ...updatedItems[index], [name]: value };

				return updatedItems; // Return the updated list
			});
		}
	}

	async function handleCreate() {
		try {
			// eslint-disable-next-line no-unused-vars
			const { charge, clientId, customer, ...createBody } = createData;

		

			setIsLoading(true);
			// Make a POST request without the Authorization header
			const response = await postRequest(
				`invoices/create?recipientId=${selectedClient?.id}`,
				createBody,
				userProfile?.accessToken
			);

			toast.success(
				type === "Invoice" ? response?.message : "Estimate created"
			);
			navigate(-1);
			triggerUpdate();
			setAllItems([]);
			// Handle successful response, e.g., show success message or reset form
		} catch (err) {
			toast?.error(err?.response?.data?.error);
			console.error(err);
			return;
		} finally {
			setIsLoading(false);
		}
	}

	function handleFormatAmount(index, e) {
		const value = parseFloat(e.target.value || 0).toFixed(3);

		setAllItems((prev) => {
			const updated = [...prev];
			updated[index].amount = value;
			return updated;
		});
	}

	function handleFormatDiscount(index, e) {
		const value = parseFloat(e.target.value || 0).toFixed(3);

		setAllItems((prev) => {
			const updated = [...prev];
			updated[index].discount = value;
			return updated;
		});
	}

	useEffect(() => {
		const sum = allItems.reduce((accumulator, item) => {
			const amount = Number(item?.amount) || 0;
			const quantity = Number(item?.quantity) || 0;
			const discount = Number(item?.discount) || 0;

			// prevent negative final amounts
			const finalAmount = Math.max(amount - discount, 0);

			return accumulator + finalAmount * quantity;
		}, 0);

		setTotal(sum.toFixed(3));
	}, [allItems]);

	return (
		<div className="py-4 bg-white">
			<div className="px-0 mx-auto max-w-7xl w-full">
				<div className="flex flex-col">
					<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
							{allItems.length > 0 && (
								<table className="min-w-full lg:divide-y lg:divide-gray-200">
									<thead className="hidden lg:table-header-group">
										<tr>
											<th className="py-3.5 pl-4 pr-3 text-left text-sm border-r border-gray-200 whitespace-nowrap font-medium text-gray-500 sm:pl-6 md:pl-0">
												<div className="flex items-center">ITEM DETAILS</div>
											</th>

											<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
												<div className="flex items-center">QUANTITY</div>
											</th>

											<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
												<div className="flex items-center">RATE</div>
											</th>

											<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
												<div className="flex items-center">DISCOUNT</div>
											</th>

											<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
												<div className="flex items-center">TAX</div>
											</th>

											<th className="border-r border-gray-200 py-3.5 px-3 text-left text-sm whitespace-nowrap font-medium text-gray-500">
												<div className="flex items-center">AMOUNT</div>
											</th>

											<th className="relative py-3.5 pl-3 pr-4 sm:pr-6 md:pr-0">
												<span className="sr-only"> Actions </span>
											</th>
										</tr>
									</thead>

									<tbody className="divide-y divide-gray-200">
										{allItems?.map((item, index) => (
											<tr key={index}>
												<td className="lg:border-r w-[50%] lg:border-gray-200 px-4 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
													{item?.name && (
														<div className="px-5  py-4 cursor-pointer ">
															<div className="flex items-start justify-between">
																<div className="flex items-center  w-full">
																	<svg
																		className="flex-shrink-0 object-cover text-gray-600 w-9 h-9"
																		viewBox="0 0 140 140"
																		fill="none"
																		xmlns="http://www.w3.org/2000/svg"
																	>
																		<path
																			d="M100.625 61.25C107.871 61.25 113.75 55.3711 113.75 48.125C113.75 40.8789 107.871 35 100.625 35C93.3789 35 87.5 40.8789 87.5 48.125C87.5 55.3711 93.3789 61.25 100.625 61.25Z"
																			fill="black"
																		/>
																		<path
																			d="M123.594 17.5H16.4062C12.1406 17.5 8.75 20.9727 8.75 25.2383V114.762C8.75 119.027 12.1406 122.5 16.4062 122.5H123.594C127.859 122.5 131.25 119.027 131.25 114.762V25.2383C131.25 20.9727 127.859 17.5 123.594 17.5ZM95.4023 71.5586C94.582 70.6016 93.3242 69.8633 91.9023 69.8633C90.5078 69.8633 89.5234 70.5195 88.4023 71.4219L83.2891 75.7422C82.2227 76.5078 81.375 77.0273 80.1445 77.0273C78.9688 77.0273 77.9023 76.5898 77.1367 75.9063C76.8633 75.6602 76.3711 75.1953 75.9609 74.7852L61.25 58.8711C60.1562 57.6133 58.5156 56.8203 56.6836 56.8203C54.8516 56.8203 53.1563 57.7227 52.0898 58.9531L17.5 100.68V29.4492C17.7734 27.5898 19.2227 26.25 21.082 26.25H118.891C120.777 26.25 122.309 27.6445 122.418 29.5312L122.5 100.734L95.4023 71.5586Z"
																			fill="currentColor"
																		/>
																	</svg>

																	<div className="ml-3 w-full">
																		<p className="mt-1 text-sm font-bold text-gray-900">
																			{item?.name}
																		</p>

																		<p className="text-sm w-full font-medium text-gray-500 break-words whitespace-normal">
																			<textarea
																				name="description"
																				id="description"
																				onChange={(e) => handleChange(index, e)}
																				value={item?.description}
																				className="w-full px-2 py-1 h-32 border text-gray-900 border-gray-300 focus:outline-none transition duration-200 focus:bg-gray-200"
																			/>
																		</p>
																	</div>
																</div>
															</div>
														</div>
													)}

													{!item?.name && (
														<SelectProductService
															index={index}
															selectedItem={selectedItem}
															setSelectedItem={setSelectedItem}
															data={data}
															allItems={allItems}
															description="Select Item"
															handleChange={handleChange}
														/>
													)}

													{/* RATE */}
													<div className="space-y-1 lg:hidden pl-11">
														<p className="text-sm font-medium text-gray-500">
															{Number(item?.amount)?.toFixed(3)}
														</p>
													</div>
												</td>

												<td className="border-r w-[10%] border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													<input
														name="quantity"
														id="quantity"
														onChange={(e) => handleChange(index, e)}
														value={item?.quantity}
														type="text"
														className="w-full px-2 py-1 text-gray-900 border-gray-300 focus:outline-none  transition duration-200 focus:bg-gray-200"
													/>
												</td>

												<td className="border-r w-[10%] border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													<input
														name="amount"
														id="amount"
														onChange={(e) => handleChange(index, e)}
														onBlur={(e) => handleFormatAmount(index, e)}
														value={item?.amount}
														type="text"
														className="w-full px-2 py-1 text-gray-900 border-gray-300 focus:outline-none  transition duration-200 focus:bg-gray-200"
													/>
												</td>

												<td className="border-r w-[10%] border-gray-200 hidden px-4 py-4 text-sm font-bold text-gray-900 lg:table-cell whitespace-nowrap">
													<input
														name="discount"
														id="discount"
														onChange={(e) => handleChange(index, e)}
														onBlur={(e) => handleFormatDiscount(index, e)}
														value={item?.discount ?? "0"}
														type="text"
														className="w-full px-2 py-1 text-gray-900 border-gray-300 focus:outline-none  transition duration-200 focus:bg-gray-200"
													/>
												</td>

												<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-medium text-gray-900 lg:table-cell whitespace-nowrap">
													<div className="inline-flex items-center">0.00</div>
												</td>

												<td className="border-r border-gray-200 hidden px-4 py-4 text-sm font-bold text-gray-900 lg:table-cell whitespace-nowrap">
													{(
														Math.max(
															(Number(item?.amount) || 0) -
																(Number(item?.discount) || 0),
															0
														) * (Number(item?.quantity) || 0)
													).toFixed(3)}
												</td>

												<td className="px-4 py-4 text-sm font-medium text-right text-gray-900 whitespace-nowrap">
													<button
														onClick={() => handleRemoveItem(index)}
														type="button"
														className="inline-flex p-2 -m-2 text-gray-400 transition-all duration-200 rounded  hover:text-gray-900"
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
													<div className="mt-1 lg:hidden">
														<p>
															{(
																Math.max(
																	(Number(item?.amount) || 0) -
																		(Number(item?.discount) || 0),
																	0
																) * (Number(item?.quantity) || 0)
															).toFixed(3)}
														</p>
														<div className="inline-flex items-center justify-end mt-1">
															{item?.quantity}
														</div>
													</div>
												</td>
											</tr>
										))}
										<tr />
									</tbody>
								</table>
							)}

							<div className="flex px-4 flex-wrap justify-between">
								<button
									onClick={handleAddItem}
									type="button"
									className={` h-[50px] lg:ml-0 mt-2 inline-flex items-center justify-center w-[200px] px-4 py-3 text-sm font-semibold leading-5 text-grey-700 transition-all duration-200 bg-gray-300 border border-transparent rounded-sm`}
								>
									<svg
										className="w-5 h-5 mr-1 "
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
									Add new Item
								</button>

								{allItems.length > 0 && (
									<div className="lg:sticky lg:order-2 mt-2 lg:top-6 lg:col-span-2">
										<div className="overflow-hidden rounded bg-gray-200 w-full max-w-[300px]">
											<div className="px-4 py-2">
												<hr className=" border-gray-200" />

												<div className="flow-root mt-1">
													<div className="-my-5 divide-y divide-gray-200">
														<div className="flex items-center justify-between py-5">
															<p className="text-sm font-medium text-gray-600">
																Subtotal
															</p>
															<p className="text-sm font-medium text-right text-gray-600">
																{Number(total).toFixed(3) || 0.0} KWD
															</p>
														</div>

														<div className="flex items-center justify-between py-1">
															<p className="text-sm font-medium text-gray-600">
																Tax
															</p>
															<p className="text-sm font-medium text-right text-gray-600">
																0.000 KWD
															</p>
														</div>

														<div className="flex items-center justify-between py-5">
															<p className="text-sm font-medium text-gray-600">
																Shipping
															</p>
															<p className="text-sm font-medium text-right text-gray-600">
																0.000 KWD
															</p>
														</div>

														<div className="flex items-center justify-between pt-2 pb-5">
															<p className="text-sm font-bold text-gray-900">
																Total
															</p>
															<p className="text-md font-bold text-right text-gray-900">
																{Number(total).toFixed(3) || 0.0} KWD
															</p>
														</div>
													</div>
												</div>
											</div>
											<div className="mt-6 flex items-center gap-[2px]">
												<PairedButton
													isLoading={isLoading}
													message={`Sending ${type}...`}
													onClick={handleCreate}
												>
													<svg
														className="w-6 h-auto mr-2 text-white"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M19.2473 12.6641C19.105 12.664 18.9641 12.6919 18.8327 12.7463C18.7012 12.8008 18.5818 12.8805 18.4812 12.9811C18.3806 13.0817 18.3008 13.2012 18.2464 13.3326C18.192 13.4641 18.164 13.6049 18.1641 13.7472V16.9967H5.1663V13.7472C5.1663 13.4599 5.05219 13.1844 4.84906 12.9813C4.64593 12.7782 4.37042 12.6641 4.08315 12.6641C3.79588 12.6641 3.52038 12.7782 3.31725 12.9813C3.11412 13.1844 3 13.4599 3 13.7472V18.0798C2.99992 18.2221 3.02788 18.363 3.08229 18.4944C3.13669 18.6259 3.21647 18.7453 3.31707 18.8459C3.41766 18.9465 3.5371 19.0263 3.66855 19.0807C3.8 19.1351 3.94089 19.1631 4.08315 19.163H19.2473C19.3895 19.1631 19.5304 19.1351 19.6619 19.0807C19.7933 19.0263 19.9128 18.9465 20.0134 18.8459C20.114 18.7453 20.1937 18.6259 20.2481 18.4944C20.3025 18.363 20.3305 18.2221 20.3304 18.0798V13.7472C20.3305 13.6049 20.3025 13.4641 20.2481 13.3326C20.1937 13.2012 20.114 13.0817 20.0134 12.9811C19.9128 12.8805 19.7933 12.8008 19.6619 12.7463C19.5304 12.6919 19.3895 12.664 19.2473 12.6641Z"
															fill="currentColor"
														/>
														<path
															d="M9.18267 9.09843L10.5832 7.69795V13.7484C10.5832 14.0356 10.6973 14.3111 10.9004 14.5143C11.1035 14.7174 11.379 14.8315 11.6663 14.8315C11.9536 14.8315 12.2291 14.7174 12.4322 14.5143C12.6353 14.3111 12.7495 14.0356 12.7495 13.7484V7.69795L14.1499 9.09843C14.3532 9.3006 14.6284 9.41391 14.9151 9.41352C15.2019 9.41312 15.4767 9.29904 15.6795 9.0963C15.8822 8.89356 15.9963 8.6187 15.9967 8.33198C15.9971 8.04526 15.8838 7.77008 15.6816 7.56678L12.4321 4.31733C12.3316 4.21672 12.2122 4.13692 12.0808 4.08247C11.9494 4.02802 11.8085 4 11.6663 4C11.5241 4 11.3832 4.02802 11.2518 4.08247C11.1204 4.13692 11.001 4.21672 10.9005 4.31733L7.65103 7.56678C7.44885 7.77008 7.33554 8.04526 7.33594 8.33198C7.33634 8.6187 7.45041 8.89356 7.65315 9.0963C7.85589 9.29904 8.13076 9.41312 8.41747 9.41352C8.70419 9.41391 8.97937 9.3006 9.18267 9.09843Z"
															fill="currentColor"
														/>
													</svg>
													Send {type}
												</PairedButton>
												<div className="h-full cursor-pointer flex bg-indigo-600 rounded-r-md text-white px-4 py-4 ">
													<svg
														className="text-white h-6 w-auto"
														viewBox="0 0 24 24"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M18 20H6C5.73478 20 5.48043 19.8946 5.29289 19.7071C5.10536 19.5196 5 19.2652 5 19C5 18.7348 5.10536 18.4804 5.29289 18.2929C5.48043 18.1054 5.73478 18 6 18H18C18.2652 18 18.5196 18.1054 18.7071 18.2929C18.8946 18.4804 19 18.7348 19 19C19 19.2652 18.8946 19.5196 18.7071 19.7071C18.5196 19.8946 18.2652 20 18 20Z"
															fill="currentColor"
														/>
														<path
															d="M15.9182 11.62C15.8432 11.4374 15.7158 11.2811 15.552 11.1707C15.3883 11.0604 15.1956 11.001 14.9982 11H12.9982V5C12.9982 4.73478 12.8928 4.48043 12.7053 4.29289C12.5178 4.10536 12.2634 4 11.9982 4C11.733 4 11.4786 4.10536 11.2911 4.29289C11.1035 4.48043 10.9982 4.73478 10.9982 5V11H8.99819C8.80076 11.001 8.60805 11.0604 8.44432 11.1707C8.2806 11.2811 8.15321 11.4374 8.07819 11.62C8.00161 11.8021 7.98068 12.0028 8.01806 12.1968C8.05543 12.3908 8.14943 12.5694 8.28819 12.71L11.2882 15.71C11.3833 15.801 11.4954 15.8724 11.6182 15.92C11.7379 15.9729 11.8673 16.0002 11.9982 16.0002C12.1291 16.0002 12.2585 15.9729 12.3782 15.92C12.5009 15.8724 12.6131 15.801 12.7082 15.71L15.7082 12.71C15.8469 12.5694 15.9409 12.3908 15.9783 12.1968C16.0157 12.0028 15.9948 11.8021 15.9182 11.62Z"
															fill="currentColor"
														/>
													</svg>
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
	);
}
