import React, { useEffect, useState } from "react";

import "react-phone-number-input/style.css";

import { NavLink, matchPath, useLocation, useNavigate } from "react-router-dom";
import { useStates } from "../../contexts/StatesContext";
import { v4 as uuidv4 } from "uuid";
import SelectComponent from "./SelectComponent";
import { getRequest, postRequest } from "../../utils/fetch-function";

import ItemsTable from "./ItemsTable";
import TemplateMenu from "./TemplateMenu";
import ClientSelector from "./ClientSelector";
import ClientSelectorMain from "./ClientSelectorMain";

export default function CreateBusiness({ type }) {
	const {
		selectedClient,

		path,
	} = useStates();

	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [nextInvoiceNo, setNextInvoiceNo] = useState("");

	const navigate = useNavigate();

	const isMain = matchPath("/clients/:id", path);

	const invoiceType = useLocation().pathname.split("/")[1];

	return (
		<section className="py-12 bg-white sm:py-16 lg:py-20">
			<div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
				<div className="max-w-6xl mx-auto">
					<div
						className={`flex items-center "justify-end"
            }`}
					>
						<div className=" flex justify-end   ">
							<ClientSelectorMain
								description={`Select the client/customer you want to create a business for!`}
								type={type?.toLowerCase()}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
