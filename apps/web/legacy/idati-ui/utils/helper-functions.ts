export const calculateTotal = (items) => {
	if (!items || !Array.isArray(items)) return 0;

	return items.reduce((total, item) => {
		const amount = Number(item.amount) || 0;
		const discount = Number(item.discount) || 0;
		const quantity = Number(item.quantity) || 1;

		return total + (amount - discount) * quantity;
	}, 0);
};
