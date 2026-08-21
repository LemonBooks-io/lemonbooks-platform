import React, { useEffect } from "react";
import "../../App.css";

const TapPaymentForm = () => {
	useEffect(() => {
		// Initialize Tap payment form or other required scripts here
		// For example: if you need to load the Tap payment SDK, you would do so here.
		// Make sure to hook into the DOM where Tap expects to render its payment element
	}, []);

	const handleSubmit = (event) => {
		event.preventDefault();
		// Handle your form submission logic, like calling the Tap payment API
	};

	return (
		<form
			id="form-container"
			method="post"
			action="/charge"
			onSubmit={handleSubmit}
		>
			{/* Tap element will be here */}
			<div id="element-container"></div>

			{/* Error handler */}
			<div id="error-handler" role="alert"></div>

			{/* Success message */}
			<div
				id="success"
				style={{ display: "none", position: "relative", float: "left" }}
			>
				Success! Your token is <span id="token"></span>
			</div>

			{/* Tap pay button */}
			<button id="tap-btn" type="submit">
				Submit
			</button>
		</form>
	);
};

export default TapPaymentForm;
