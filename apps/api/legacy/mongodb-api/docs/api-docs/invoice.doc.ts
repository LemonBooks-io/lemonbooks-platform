/**
 * @openapi
 * /invoices/create:
 *   post:
 *     summary: Create a new invoice
 *     tags:
 *       - Invoices
 *     parameters:
 *       - in: query
 *         name: recipientId
 *         required : true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createInvoice'
 *     responses:
 *       201:
 *         description: Invoice created successfully
 */

/**
 * @openapi
 * /invoices/all:
 *   get:
 *     summary: Get all invoices
 *     tags:
 *       - Invoices
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: draft
 *         schema:
 *           type: boolean
 *           default : true
 *       - in: query
 *         name: recipientId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoices fetched
 */

/**
 * @openapi
 * /invoices/{invoiceId}:
 *   get:
 *     summary: Get invoice by ID
 *     tags:
 *       - Invoices
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           example: "1"
 *       - in: header
 *         name: X-Tenant-Id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice fetched
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /invoices/{invoiceId}/resend:
 *   post:
 *     summary: Resend an existing invoice to the customer
 *     tags:
 *       - Invoices
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the invoice to resend
 *     responses:
 *       200:
 *         description: Invoice resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Invoice resent successfully"
 *                 data:
 *                   type: object
 *                   nullable: true
 *       404:
 *         description: Invoice, customer, or business not found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /invoices/bulk:
 *   post:
 *     summary: Create bulk invoice
 *     tags:
 *       - Invoices
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                invoiceIds:
 *                  type : array
 *                  items:
 *                     type: string
 *     responses:
 *       200:
 *         description: Invoice fetched
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /invoices/payment-links:
 *   post:
 *     summary: Get payment links for multiple invoices
 *     tags:
 *       - Invoices
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                invoiceIds:
 *                  type : array
 *                  items:
 *                     type: string
 *     responses:
 *       200:
 *         description: Payment links fetched successfully
 *       404:
 *         description: Invoices not found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /invoices/mark-as-read/{invoiceId}:
 *   post:
 *     summary: Mark invoice view status as read
 *     tags:
 *       - Invoices
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice marked as read
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /invoices/approve-estimate/{invoiceId}:
 *   post:
 *     summary: Approve an estimate invoice
 *     tags:
 *       - Invoices
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice approved
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /invoices/void-invoice/{invoiceId}:
 *   post:
 *     summary: Void an invoice
 *     tags:
 *       - Invoices
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice voided
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /invoices/convert-estimate/{invoiceId}:
 *   post:
 *     summary: Convert an estimate to a regular invoice
 *     description: |
 *       Converts a draft invoice (estimate) to a regular invoice. This operation will:
 *       - Change the invoice status to APPROVED
 *       - Set draft flag to false
 *       - Generate payment URLs (custom and Tap payment if enabled)
 *       - Create service subscriptions for any service items
 *       - Send invoice notification email to the customer
 *     tags:
 *       - Invoices
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the estimate to convert
 *     requestBody:
 *       required: true 
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              due:
 *                type: number
 *                description: Due date in UNIX timestamp format
 *              expiry:
 *                type: number
 *                description: Expiry date in UNIX timestamp format
 * 
 *     responses:
 *       200:
 *         description: Estimate converted to invoice successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estimate converted to invoice successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     invoice:
 *                       type: object
 *                       description: The converted invoice object
 *                     paymentLinks:
 *                       type: object
 *                       properties:
 *                         tapInvoiceUrl:
 *                           type: string
 *                           nullable: true
 *                           example: "https://tap.company/invoice/xxxxx"
 *                         customInvoiceUrl:
 *                           type: string
 *                           nullable: true
 *                           example: "https://yourdomain.com/custom-payment?invoiceId=xxxxx"
 *       400:
 *         description: Bad request - Invoice is not an estimate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "This invoice is not an estimate"
 *       404:
 *         description: Estimate, customer, or business not found
 *       422:
 *         description: Unprocessable entity - Tap payment enabled but no key set
 *       500:
 *         description: Internal server error
 */
