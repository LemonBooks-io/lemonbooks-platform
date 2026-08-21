export default function ClientInfoBannar({ selectedClient }) {
	return (
		<div className="py-7">
			<h2 className="text-base font-bold text-gray-900">Client Information</h2>

			<div className="grid grid-cols-1 mt-6 sm:grid-cols-2 gap-y-5 gap-x-6">
				<div className="grid sm:grid-cols-2 col-span-2 w-full gap-x-6 gap-y-2">
					<div className=" col-span-1  ">
						<label className="text-sm font-medium text-gray-600">
							{" "}
							First Name
						</label>
						<div className="mt-2">
							<div className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
								{selectedClient?.firstName}
							</div>
						</div>
					</div>

					<div className="col-span-1">
						<label className="text-sm font-medium text-gray-600">
							{" "}
							Last Name
						</label>
						<div className="mt-2">
							<div className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
								{selectedClient?.lastName}
							</div>
						</div>
					</div>
				</div>

				<div className="grid sm:grid-cols-2 col-span-2 w-full gap-x-6 gap-y-2">
					<div className=" col-span-1  ">
						<label className="text-sm font-medium text-gray-600">
							{" "}
							Phone No.
						</label>
						<div className="mt-2">
							<div className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
								{selectedClient?.phone?.countryCode} -{" "}
								{selectedClient?.phone?.number}
							</div>
						</div>
					</div>

					<div className="col-span-1">
						<label className="text-sm font-medium text-gray-600"> Email</label>
						<div className="mt-2">
							<div className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900">
								{selectedClient?.email}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
