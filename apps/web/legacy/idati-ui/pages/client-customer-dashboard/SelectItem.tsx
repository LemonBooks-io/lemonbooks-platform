import { Category } from "iconsax-react";
import React, { useState } from "react";
import { useStates } from "../../contexts/StatesContext";

export default function SelectItem({ search, setSearch }) {
	const { serviceToAddBody, setServiceToAddBody, productsAndServices } =
		useStates();
	const [isOpenSelection, setIsOpenSelection] = useState(false);

	const filteredServices = productsAndServices?.offerings?.filter(
		(service) => service?.name === "billings-portal"
	);

	function handleAdd(id) {
		const serviceSelected = filteredServices?.find(
			(service) => service?.id === id
		);

		setSearch(serviceSelected?.name);

		setServiceToAddBody((pre) => ({ ...pre, ...serviceSelected }));

		setIsOpenSelection(false);
	}

	async function addServiceHandler(serviceCode) {
		console.log("the service has been added");
	}

	return (
		<div className=" ">
			<div className="w-[200px]  max-w-7xl">
				<div className=" ">
					<div className="relative">
						<div className="relative mt-2">
							{filteredServices && (
								<div className="flex gap-1 pl-2">
									<svg
										className="flex-shrink-0 object-cover text-gray-600 w-6 h-6"
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
									</svg>{" "}
									<input
										onFocus={() => {
											setIsOpenSelection(true);
											setServiceToAddBody((prev) => ({ ...prev, name: "" }));
										}}
										type="text"
										id="country-selector"
										placeholder="Service name"
										value={
											serviceToAddBody?.name !== ""
												? serviceToAddBody?.name
												: search
										}
										onChange={(e) => setSearch(e.target.value)}
										className="w-full px-2 py-1 text-gray-900  border-gray-300 focus:outline-none  transition duration-200 "
									/>
								</div>
							)}
						</div>

						{isOpenSelection &&
							search.length > 2 &&
							filteredServices.length > 0 && (
								<div className="relative  z-10">
									<div className="border border-gray-300 bg-white shadow rounded-lg w-full text-sm px-4 py-2 space-y-2">
										<ul className="flex flex-col">
											{filteredServices?.map((service) => (
												<li
													key={service?.id}
													className="  rounded-md p-2  cursor-pointer"
													onClick={() => handleAdd(service?.id)}
												>
													<div className=""> {service?.name}</div>
													<div className="font-thin text-xs">
														{" "}
														{service?.description}
													</div>{" "}
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
