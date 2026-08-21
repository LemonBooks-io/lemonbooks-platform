/**
 * @openapi
 *  /customer/create:
 *      post:
 *         summary: Create customer.
 *         tags:
 *            - Customer
 *         security:
 *           - bearerAuth: []
 *         requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                     schema:
 *                        type: object
 *                        properties:
 *                          firstName:
 *                            type: string
 *                          lastName:
 *                            type: string
 *                          email:
 *                            type: string
 *                          company:
 *                            type: string
 *                          city:
 *                            type: string
 *                          country:
 *                            type: string
 *                          state:
 *                            type: string
 *                          address:
 *                            type: string
 *                          phone:
 *                            type: object
 *                            properties:
 *                              countryCode:
 *                                type: string
 *                              number:
 *                                type: string
 *                          openBalance:
 *                              type: object
 *                              properties:
 *                                description:
 *                                  type: string
 *                                  default: ""
 *                                amount:
 *                                   type: number
 *                                   default: 1
 *         responses:
 *           "201":
 *             description: Admin account created successfully
 *             content:
 *               application/json:
 *                 schema:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "Account created, please check email for credentials"
 *                     data:
 *                       type: null
 *                       example: null
 *           "400":
 *             description: Bad Request - Invalid input data
 *           "401":
 *             description: Unauthorized - Invalid or missing token
 *           "409":
 *             description: Conflict - Admin account already exists with this email
 */

/**
 * @openapi
 * /customer/all:
 *      get:
 *         summary: Get all customers.
 *         tags:
 *            - Customer
 *         parameters:
 *           - in: query
 *             name: offset
 *             required: true
 *             default : 1
 *             schema:
 *               type: string
 *           - in: query
 *             name: limit
 *             default : 20
 *             schema:
 *               type: string
 *         responses:
 *           "200":
 *             description: success
 */

/**
 * @openapi
 * /customer/subscriptions/{customerId}:
 *      get:
 *         summary: Get customers subscriptions.
 *         tags:
 *            - Customer
 *         parameters:
 *           - in: query
 *             name: offset
 *             required: true
 *             default : 1
 *             schema:
 *               type: string
 *           - in: query
 *             name: limit
 *             default : 20
 *             schema:
 *               type: string
 *           - in: path
 *             name: customerId
 *             schema:
 *               type: string
 *         responses:
 *           "200":
 *             description: success
 */

/**
 * @openapi
 * /customer/bulk:
 *      post:
 *         summary: Bulk create new customers from csv
 *         tags:
 *            - Customer
 *         requestBody:
 *              required: true
 *              content:
 *                  multipart/form-data:
 *                     schema:
 *                        $ref: '#/components/schemas/BulkUpload'
 *         responses:
 *            "200":
 *               description: success
 */

/**
 * @openapi
 * /customer/{customerId}:
 *      get:
 *         summary: Get customer by id.
 *         tags:
 *            - Customer
 *         parameters:
 *           - in: path
 *             name: customerId
 *             schema:
 *               type: string
 *         responses:
 *           "200":
 *             description: success
 */

/**
 * @openapi
 * /customer/statement:
 *      get:
 *         summary: Get customer account statement.
 *         tags:
 *            - Customer
 *         parameters:
 *           - in: query
 *             name: startDate
 *             required: true
 *             schema:
 *               type: string
 *               example : 2025-07-10T00:00:00.000Z
 *           - in: query
 *             name: endDate
 *             required: true
 *             schema:
 *               type: string
 *               example : 2025-06-20T00:00:00.000Z
 *         responses:
 *           "200":
 *             description: success
 */

/**
 * @openapi
 * /customer:
 *   patch:
 *     summary: Edit customer details.
 *     description : This endpoint allows you to update customer information, not all data are required, payload depends on which fields need to be edited.
 *     tags:
 *       - Customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               company:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               state:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: object
 *                 properties:
 *                   countryCode:
 *                     type: string
 *                   number:
 *                     type: string
 *     responses:
 *       "200":
 *         description: Customer updated successfully
 *       "400":
 *         description: Bad Request - Invalid input data
 *       "401":
 *         description: Unauthorized - Invalid or missing token
 *       "404":
 *         description: Customer not found
 */

/**
 * @openapi
 * /customer/admin-edit/{customerId}:
 *   patch:
 *     summary: Admin edit customer details.
 *     description : This endpoint allows admin to update customer information, not all data are required, payload depends on which fields need to be edited.
 *     tags:
 *       - Customer
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               company:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               state:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: object
 *                 properties:
 *                   countryCode:
 *                     type: string
 *                   number:
 *                     type: string
 *     responses:
 *       "200":
 *         description: Customer updated successfully
 *       "400":
 *         description: Bad Request - Invalid input data
 *       "401":
 *         description: Unauthorized - Invalid or missing token
 *       "404":
 *         description: Customer not found
 */

/**
 * @openapi
 * /customer/subscription/cancel/{subscriptionId}:
 *   patch:
 *     summary: Cancel a customer subscription.
 *     description: This endpoint allows cancelling a customer subscription by setting the isCancelled flag to true.
 *     tags:
 *       - Customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the subscription to cancel
 *     responses:
 *       "200":
 *         description: Subscription cancelled successfully
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
 *                   example: "Subscription cancelled successfully"
 *                 data:
 *                   type: null
 *                   example: null
 *       "400":
 *         description: Bad Request - Subscription is already cancelled
 *       "401":
 *         description: Unauthorized - Invalid or missing token
 *       "403":
 *         description: Forbidden - Unauthorized to cancel this subscription
 *       "404":
 *         description: Subscription not found
 */
