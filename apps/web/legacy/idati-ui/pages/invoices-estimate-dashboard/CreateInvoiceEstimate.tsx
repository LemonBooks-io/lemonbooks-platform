/* eslint-disable react/prop-types */
import "react-phone-number-input/style.css";

import ClientSelectorMain from "./ClientSelectorMain";

export default function CreateInvoiceEstimate({ type }) {
	return (
		<section className="py-12 bg-white sm:py-16 lg:py-20 border-2 h-screen">
			<div className="px-4 w-full mx-auto sm:px-6 lg:px-8 max-w-7xl">
				<div className="max-w-6xl w-full mx-auto">
					<div
						className={`flex items-center justify-end"
            }`}
					>
						<div className="flex  w-full">
							<ClientSelectorMain
								description={`Select the client/customer you want to create ${
									type === "business" ? "a" : "an"
								} ${type} for!`}
								type={type?.toLowerCase()}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
