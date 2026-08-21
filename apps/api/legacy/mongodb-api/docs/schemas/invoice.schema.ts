/**
 * @openapi
 * components:
 *    schemas:
 *       createInvoice:
 *          type: object
 *          required:
 *             - draft
 *             - due
 *             - expiry
 *             - customer
 *             - order
 *          properties:
 *             draft:
 *                type: boolean
 *                description: Indicates if the invoice is a draft
 *             due:
 *                type: number
 *                description: Due amount for the invoice
 *             expiry:
 *                type: number
 *                description: Expiry date of the invoice
 *             description:
 *                type: string
 *                description: Description of the invoice
 *             note:
 *                type: string
 *                description: Additional note for the invoice
 *             order:
 *                type: object
 *                required:
 *                   - items
 *                properties:
 *                   items:
 *                      type: array
 *                      description: Items in the order
 *                      items:
 *                         type: object
 *                         required:
 *                            - amount
 *                            - quantity
 *                            - itemId
 *                         properties:
 *                            amount:
 *                               type: number
 *                               description: Amount of the item
 *                            quantity:
 *                               type: number
 *                               description: Quantity of the item
 *                            itemId:
 *                               type: string
 *                               description: Id of the item
 *                            description:
 *                               type: string
 *                               description: Description of the item
 *                            name:
 *                               type: string
 *                               description: Name of the item
 *                            currency:
 *                               type: string
 *                               description: Currency of the item
 */
