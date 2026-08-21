import React, { useEffect, useState } from "react";

import "react-phone-number-input/style.css";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";
import { v4 as uuidv4 } from "uuid";
import SelectComponent from "./SelectComponent";
import { getRequest, postRequest } from "../../utils/fetch-function";

import TemplateMenu from "./TemplateMenu";
import ClientSelector from "../invoices-estimate-dashboard/ClientSelector";
import ServicesTable from "./ServicesTable";
import { TickCircle } from "iconsax-react";
import ClientInfoBannar from "./ClientInfoBannar";

export default function ClientSupport({ type }) {
	const itemInit = {
		amount: "0", //rate of each item
		currency: "KWD",
		name: "",
		description: "",
		quantity: "1",
	};

	const {
		setRefresh,
		allClients,
		setAllClients,
		updateData,
		setIsFetching,

		accessToken,
		setAllServices,
		setItems,
		items,
		userProfile,
		selectedClient,
		setSelectedClient,
		allItems,
		setAllItems,
	} = useStates();

	const [isLoading, setIsLoading] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [nextInvoiceNo, setNextInvoiceNo] = useState("");
	const [clientId, setClientId] = useState("");
	const navigate = useNavigate();

	const invoiceType = useLocation().pathname.split("/")[1];

	const { id } = useParams();
	useEffect(() => {
		if (id && allClients) {
			const selected = allClients?.customers?.find(
				(client) => client?.id === id
			);

			setSelectedClient(selected);
		}
	}, [id, allClients]);

	const [eachItem, setEachItem] = useState(itemInit);
	const [total, setTotal] = useState(0);

	const [selectedItem, setSelectedItem] = useState(null);
	const [dueDate, setDueDate] = useState(
		new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
	);
	const [expiryDate, setExpiryDate] = useState(
		new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
	);

	function handleAddItem() {
		setAllItems((prevItems) => [...prevItems, itemInit]);
		setSelectedItem(null);
	}

	function handleRemoveItem(index) {
		setAllItems((prevItems) => {
			// Get the item to be removed
			const itemToRemove = prevItems[index];

			// Update the total by subtracting the item's value
			// if (itemToRemove?.amount && itemToRemove?.quantity) {
			//   setTotal(
			//     (cur) =>
			//       cur - Number(itemToRemove.amount) * Number(itemToRemove.quantity)
			//   );
			// }

			// Remove the item from the list
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
					name: value?.itemName,
					description: value?.description,
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

	// function handleRemoveItem(index) {
	//   setAllItems((prevItems) => {
	//     // Get the item to be removed
	//     const itemToRemove = prevItems[index];

	//     // Update the total by subtracting the item's value
	//     if (itemToRemove?.amount && itemToRemove?.quantity) {
	//       setTotal(
	//         (cur) =>
	//           cur - Number(itemToRemove.amount) * Number(itemToRemove.quantity)
	//       );
	//     }

	//     // Remove the item from the list
	//     return prevItems.filter((_, itemIndex) => itemIndex !== index);
	//   });
	// }

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

	useEffect(() => {
		const sum = allItems.reduce(
			(accumulator, item) =>
				accumulator + Number(item?.amount) * Number(item?.quantity),
			0
		);

		setTotal(() => sum.toFixed(3));
	}, [allItems]);

	return (
		<section className="pb-12 pt-8  bg-white ">
			<div className=" mx-auto space-y-8">
				<div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
					<div className="flex justify-between items-start">
						<div className="text-lg font-semibold text-gray-900">
							I am having intermittent login issues, how do I solve it?
						</div>
						<TickCircle
							className="w-5 h-5 text-green-500 cursor-pointer"
							title="Mark this as resolved"
						/>
					</div>

					<div className="mt-4 text-gray-700 text-base">
						I have been having intermittent issues with logging into my account.
						Especially when I login and leave it for a while, when I return my
						dashboard becomes blank. I have to clear my cache to get it to work
						again, please can this be fixed as it is inconvenient.
					</div>

					<div className="mt-6">
						<label
							htmlFor="tech-response"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Tech Team Response
						</label>
						<textarea
							id="tech-response"
							rows={4}
							className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
							placeholder="Type your response here..."
						></textarea>
						<div className="mt-3 flex justify-end">
							<button
								type="button"
								className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 transition"
							>
								Send Response
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
