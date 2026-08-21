import axios from "axios";

const invoiceData = {
	draft: false,
	due: "1736655251000",
	expiry: "1736655251000",
	description: "test invoice",
	mode: "INVOICE",
	note: "THIS IS A TEST",
	notifications: {
		channels: ["SMS", "EMAIL"],
		dispatch: true,
	},
	metadata: {
		udf1: "1",
		udf2: "2",
		udf3: "3",
	},
	charge: {
		receipt: {
			email: true,
			sms: true,
		},
	},
	customer: {
		//if new customer
		first_name: "Allaa",
		last_name: "Alhasan",
		email: "answertab2015@gmail.com",
		phone: {
			country_code: "+965",
			number: "50030756",
		},
		//   id: "cus_TS05A0920240335n8QY2112029", //if it is to an existing customer
	},
	statement_descriptor: "test",
	order: {
		amount: "76",
		items: [
			{
				amount: "10",
				currency: "KWD",
				name: "mango",
				description: "mango",
				quantity: "6",
			},
			{
				amount: "3",
				currency: "KWD",
				name: "banana",
				description: "banana",
				quantity: "2",
			},
			{
				amount: "1",
				currency: "KWD",
				name: "orange",
				description: "orange",
				quantity: "10",
			},
		],
		currency: "KWD",
	},
	post: {
		url: "http://your_website.com/post_url",
	},
	redirect: {
		url: "http://your_website.com/redirect_url",
	},
	reference: {
		invoice: "INV_00001",
		order: "ORD_00001",
	},
	retry_for_captured: true,
};

const BASE_URL = "http://localhost:3000";

async function createInvoice() {
	try {
		// Make a POST request without the Authorization header
		const response = await axios.post(
			`${BASE_URL}/create-invoice`,
			invoiceData,
			{
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
			}
		);
	} catch (err) {
		console.error(
			"Error creating invoice:",
			err.response ? err.response.data : err.message
		);
	}
}

const currentDate = Date.now();

const allInvoiceData = {
	period: {
		date: {
			from: "1735708800000", // Replace with actual 'from' timestamp
			to: `${currentDate}`, // Replace with actual 'to' timestamp
		},
	},
};

export async function getAllInvoice() {
	try {
		// Make a POST request without the Authorization header
		const response = await axios.post(
			`${BASE_URL}/get-all-invoice`,
			allInvoiceData,
			{
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
			}
		);
	} catch (err) {
		console.error(
			"Error creating invoice:",
			err.response ? err.response.data : err.message
		);
	}
}

createInvoice();
