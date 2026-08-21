/**
 * @openapi
 * /payment/upload-payment-proof/{invoiceId}:
 *   post:
 *     summary: Upload payment proof
 *     tags:
 *       - Payments
 *     parameters:
 *      - in: path 
 *        name: invoiceId
 *        required: true
 *        schema:
 *           type: string
 *      - in: header 
 *        name: X-Tenant-Id
 *        required: true
 *        schema:
 *           type: string
 *           example : "administrator"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *              referenceId: 
 *                 type: string
 *              additionalDetails: 
 *                 type: string
 *              otherPaymentMethod: 
 *                 type: string
 *              paymentMethod: 
 *                 type: string
 *                 enum: ['BANK_TRANSFER', 'CASH', 'CHEQUE','LINK', 'OTHERS']
 *              image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (PNG, JPG, JPEG only, max 5MB)
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 */

/**
 * @openapi
 * /payment/get-payment-proofs:
 *   get:
 *     summary: Get payment proofs for a business
 *     tags:
 *       - Payments
 *     parameters:
 *      - in: query 
 *        name: limit
 *        required: true
 *        schema:
 *           type: number
 *           default : 20
 *      - in: query 
 *        name: offset
 *        required: true
 *        schema:
 *           type: number
 *           default : 1
 *     responses:
 *       200:
 *         description: Proofs fetched successfully
 */

/**
 * @openapi
 * /payment/get-payment-proofs/{invoiceId}:
 *   get:
 *     summary: Get payment proof by invoice id
 *     tags:
 *       - Payments
 *     parameters:
 *      - in: path 
 *        name: invoiceId
 *        required: true
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment Proof fetched
 */

/**
 * @openapi
 * /payment/approve/{proofId}:
 *   patch:
 *     summary: Approve payment proof
 *     tags:
 *       - Payments
 *     parameters:
 *      - in: path 
 *        name: proofId
 *        required: true
 *        schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 */