import { Category } from "iconsax-react";
import React, { useState } from "react";
import { useStates } from "../../contexts/StatesContext";

export default function SelectProductService({
	handleChange,
	data = ["hello"],
	allItems,
	setSelectedItem,

	index = 0,
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");

	const { selectedClient, expiryDate, setExpiryDate, productsAndServices } =
		useStates();

	const fieldsToSearch = ["name", "description", "type"];
	const filteredProductsAndServices = productsAndServices?.offerings?.filter(
		(value) =>
			fieldsToSearch.some((field) =>
				value[field]?.toLowerCase().includes(search.toLowerCase())
			)
	);

	return (
		<div className="relative">
			{/* Fullscreen transparent overlay to close dropdown on click outside */}
			{isOpen && (
				<div
					className="fixed top-0 left-0 w-full h-full z-40 bg-transparent"
					onClick={() => setIsOpen(false)}
				></div>
			)}

			<div className=" max-w-7xl relative z-50">
				<div className="relative">
					{allItems && !allItems[index]?.name && (
						<input
							onFocus={() => setIsOpen(true)}
							type="text"
							id="country-selector"
							placeholder="Item name"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full px-2 py-1 text-gray-900  focus:outline-none transition duration-200 focus:bg-gray-200"
						/>
					)}

					{/* Dropdown menu - absolutely positioned, overlays content */}
					{search.length > 1 && isOpen && (
						<div className="absolute top-full left-0 w-full z-50 mt-1">
							<div className="border border-gray-300 bg-white shadow rounded-lg text-sm px-4 py-2 space-y-2">
								<ul className="flex flex-col">
									{filteredProductsAndServices?.map((item) => (
										<li
											key={item?.id}
											className="rounded-md p-2 hover:bg-gray-100 cursor-pointer"
											onClick={() => {
												handleChange(index, {
													target: { name: "itemObject", value: item },
												});
												setSelectedItem(item);
												setIsOpen(false);
											}}
										>
											<div>{item?.name}</div>
											<div className="font-thin text-xs break-words whitespace-normal ">
												{item?.description}
											</div>
										</li>
									))}
								</ul>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
