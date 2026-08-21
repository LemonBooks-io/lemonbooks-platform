import { Category } from "iconsax-react";
import React, { useState } from "react";
import { useStates } from "../../contexts/StatesContext";

export default function SelectCategory({ handleItemChange }) {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState("");
	const { categories } = useStates();

	const filteredCategories = categories?.filter((category) =>
		category.categoryName.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="pb-5 bg-white">
			<div className="mx-auto  max-w-7xl">
				<div className=" mx-auto">
					{isOpen && (
						<div
							className="absolute top-0 left-0 w-full h-screen z-0 bg-transparent"
							onClick={() => setIsOpen(false)}
						></div>
					)}
					<div className="relative">
						<div className="mt-2">
							<div
								onClick={() => setIsOpen(!isOpen)}
								className="cursor-pointer block w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
							>
								<div className="flex justify-between items-center">
									<div className="flex items-center space-x-2">
										<Category className="h-4 w-4 text-gray-400" />

										<span>
											{selected ? `${selected}` : "Select item category"}
										</span>
									</div>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className={`h-4 w-4 transform ${
											isOpen ? "rotate-180" : ""
										}`}
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</div>
							</div>
						</div>

						{isOpen && (
							<div className="relative w-full z-10">
								<div className="border border-gray-300 bg-white shadow rounded-lg w-full text-sm px-4 py-2 space-y-2">
									<div className="relative mt-2">
										<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="w-4 h-4 text-gray-400"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth="2"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
												/>
											</svg>
										</div>

										<input
											type="text"
											id="country-selector"
											placeholder="Search"
											value={search}
											onChange={(e) => setSearch(e.target.value)}
											className="block w-full py-2 pl-8 pr-2 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm caret-indigo-600"
										/>
									</div>
									<ul className="flex flex-col">
										{filteredCategories?.map((category) => (
											<li
												key={category?.id}
												className="w-full rounded-md p-2 hover:bg-gray-100 cursor-pointer"
												onClick={() => {
													setSelected(category?.categoryName);
													handleItemChange({
														target: {
															name: "categoryName",
															value: category?.categoryName,
														},
													});

													//   setSearch();
													setIsOpen(false);
												}}
											>
												{category?.categoryName}
											</li>
										))}
									</ul>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
