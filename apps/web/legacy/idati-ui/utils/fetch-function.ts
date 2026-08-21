import axios from "axios";
import { toast } from "sonner";

export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function getRequest(resource, query, accessToken) {
	try {
		const url = !query?.trim()
			? `${BASE_URL}/api/v2/${resource}`
			: `${BASE_URL}/api/v2/${resource}?${query}`;

		const res = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${accessToken}`, // Add the token in the Authorization header
			},
		});

		if (res) {
			return res?.data?.data;
		}
	} catch (error) {
		console.error("Get Request Error", error);
		throw error; // Re-throw for error handling upstream
	}
}

export async function putRequest(
	resource,
	body,
	accessToken = "",
	tenant = ""
) {
	let headers = {
		Authorization: `Bearer ${accessToken}`, // Token added in headers
		"Content-Type": "application/json",
	};

	if (tenant !== "") {
		headers.tenantId = tenant;
	}

	try {
		const res = await axios.put(`${BASE_URL}/api/v2/${resource}`, body, {
			headers,
		});

		if (res) {
			return res.data;
		}
	} catch (e) {
		toast.error(e?.response?.data?.error);
	}
}

export async function postRequest(
	resource,
	body,
	accessToken = "",
	tenant = ""
) {
	let headers = {
		Authorization: `Bearer ${accessToken}`, // Token added in headers
		"Content-Type": "application/json",
	};

	if (tenant !== "") {
		headers.tenantId = tenant;
	}

	try {
		const res = await axios.post(`${BASE_URL}/api/v2/${resource}`, body, {
			headers,
		});

		if (res) {
			return res.data;
		}
	} catch (e) {
		toast.error(e?.response?.data?.error);
	}
}

export async function patchRequest(
	resource,
	body,
	accessToken = "",
	tenant = ""
) {
	let headers = {
		Authorization: `Bearer ${accessToken}`, // Token added in headers
		"Content-Type": "application/json",
	};

	if (tenant !== "") {
		headers.tenantId = tenant;
	}

	try {
		const res = await axios.patch(`${BASE_URL}/api/v2/${resource}`, body, {
			headers,
		});

		if (res) {
			return res.data;
		}
	} catch (e) {
		toast.error(e?.response?.data?.error);
	}
}

export async function postMulti(resource, body, accessToken = "", tenant = "") {
	let headers = {
		Authorization: `Bearer ${accessToken}`, // Token added in headers
		// "Content-Type": "application/json",
	};

	if (tenant !== "") {
		headers.tenantId = tenant;
	}

	try {
		const res = await axios.post(`${BASE_URL}/api/v2/${resource}`, body, {
			headers,
		});

		if (res) {
			return res.data;
		}
	} catch (e) {
		toast.error(e?.response?.data?.error);
	}
}
