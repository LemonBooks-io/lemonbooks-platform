import { MoneyArchive, MoneyRecive } from "iconsax-react";
import React, { useState } from "react";
import { useStates } from "../../contexts/StatesContext";

export default function CustomerSummaryCard() {
	const { userProfile } = useStates();

	return (
		<div className="py-0 flex w-full h-full">
			<div className="px-0 mx-auto max-w-7xl w-full pb-4   ">
				<div className=" h-full mx-auto overflow-hidden border border-gray-300  rounded-xl">
					<div className="px-4 py-4 ">
						<div className="pt-6">
							<p className="text-lg font-normal text-gray-900">
								Welcome <span className="font-bold">{userProfile?.name} </span>
							</p>
							<p className="mt-1 text-sm font-medium text-gray-500">
								Email: {userProfile?.email}
							</p>
						</div>
					</div>

					<div className="px-4 py-4 ">
						<div>
							<p className="text-lg font-bold text-gray-900">Account Summary</p>
							<p className="mt-1 text-sm font-medium text-gray-500">
								Account summary are as follows
							</p>
						</div>

						<div className="mt-4 space-y-3">
							<div className="overflow-hidden bg-white shadow-sm rounded-xl">
								<div className="px-4 py-5 sm:p-6">
									<div className="flex items-center justify-between space-x-5">
										<div className="flex items-center flex-1">
											<MoneyRecive className="flex-shrink-0 object-cover w-8 h-auto rounded-full" />
											<div className="flex-1 min-w-0 ml-4">
												<p className="text-sm font-bold text-gray-900 truncate">
													Total Payments
												</p>
												<p className="mt-1 text-sm font-medium text-gray-500 truncate">
													12 Payments made
												</p>
											</div>
										</div>

										<div className="flex items-center justify-end space-x-3">
											2000 KWD
										</div>
									</div>
								</div>
							</div>

							<div className="overflow-hidden bg-white shadow-sm rounded-xl">
								<div className="px-4 py-5 sm:p-6">
									<div className="flex items-center justify-between space-x-5">
										<div className="flex items-center flex-1 ">
											<svg
												className="flex-shrink-0 object-cover w-8 text-gray-700 h-auto "
												viewBox="0 0 24 24"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M22 9H19V2C19 1.81429 18.9483 1.63225 18.8507 1.47427C18.753 1.31629 18.6133 1.18863 18.4472 1.10557C18.2811 1.02252 18.0952 0.987363 17.9102 1.00404C17.7252 1.02072 17.5486 1.08857 17.4 1.2L15.33 2.75C12.21 0.420001 13.1 0.420001 10 2.75C6.89 0.420001 7.77 0.420001 4.66 2.75L2.6 1.2C2.45143 1.08857 2.27477 1.02072 2.08981 1.00404C1.90484 0.987363 1.71889 1.02252 1.55279 1.10557C1.38668 1.18863 1.24698 1.31629 1.14935 1.47427C1.05171 1.63225 1 1.81429 1 2V20C1 20.7956 1.31607 21.5587 1.87868 22.1213C2.44129 22.6839 3.20435 23 4 23H20C20.7956 23 21.5587 22.6839 22.1213 22.1213C22.6839 21.5587 23 20.7956 23 20V10C23 9.73478 22.8946 9.48043 22.7071 9.29289C22.5196 9.10536 22.2652 9 22 9ZM4 21C3.73478 21 3.48043 20.8946 3.29289 20.7071C3.10536 20.5196 3 20.2652 3 20V4C5 5.47 4.41 5.44 7.33 3.25C10.43 5.58 9.55 5.58 12.66 3.25C15.66 5.49 15.08 5.44 17 4C17 20.75 16.92 20.3 17.17 21H4ZM21 20C21 20.2652 20.8946 20.5196 20.7071 20.7071C20.5196 20.8946 20.2652 21 20 21C19.7348 21 19.4804 20.8946 19.2929 20.7071C19.1054 20.5196 19 20.2652 19 20V11H21V20Z"
													fill="currentColor"
												/>
												<path
													d="M14 17H6C5.73478 17 5.48043 17.1054 5.29289 17.2929C5.10536 17.4804 5 17.7348 5 18C5 18.2652 5.10536 18.5196 5.29289 18.7071C5.48043 18.8946 5.73478 19 6 19H14C14.2652 19 14.5196 18.8946 14.7071 18.7071C14.8946 18.5196 15 18.2652 15 18C15 17.7348 14.8946 17.4804 14.7071 17.2929C14.5196 17.1054 14.2652 17 14 17Z"
													fill="currentColor"
												/>
												<path
													d="M8.63047 9.51453C8.63047 8.96662 9.43183 8.87306 10.1269 8.87306C10.7821 8.87306 11.6773 9.18011 12.4258 9.56817L12.5725 8.05802C12.1982 7.84401 11.3298 7.59003 10.4477 7.53696L10.6614 6H9.2315L9.44556 7.53696C7.60151 7.71044 7 8.77945 7 9.6749C7 11.9332 11.2091 11.4527 11.2091 12.8419C11.2091 13.3635 10.7151 13.5502 9.84621 13.5502C8.67048 13.5502 7.78815 13.1363 7.33413 12.7084L7.10672 14.4057C7.53475 14.6597 8.40287 14.8868 9.44556 14.9404L9.2315 16.4238H10.6614L10.4477 14.9268C12.6125 14.7396 13 13.5902 13 12.8288C13 10.1429 8.63047 10.8107 8.63047 9.51453Z"
													fill="currentColor"
												/>
											</svg>

											<div className="flex-1 min-w-0 ml-4">
												<p className="text-sm font-bold text-gray-900 truncate">
													All Invoices (due)
												</p>
												<p className="mt-1 text-sm font-medium text-gray-500 truncate">
													30 Invoices received
												</p>
											</div>
										</div>

										<div className="flex items-center justify-end space-x-3">
											1000 KWD
										</div>
									</div>
								</div>
							</div>

							<div className="overflow-hidden bg-white shadow-sm rounded-xl">
								<div className="px-4 py-5 sm:p-6">
									<div className="flex items-center justify-between space-x-5">
										<div className="flex items-center flex-1">
											<MoneyArchive className="flex-shrink-0 object-cover w-8 text-gray-700 h-auto " />

											<div className="flex-1 min-w-0 ml-4">
												<p className="text-sm font-bold text-gray-900 truncate">
													All Estimates Received
												</p>
												<p className="mt-1 text-sm font-medium text-gray-500 truncate">
													10 Estimates received
												</p>
											</div>
										</div>

										<div className="flex items-center justify-end space-x-3">
											560 KWD
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
