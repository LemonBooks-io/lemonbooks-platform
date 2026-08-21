/**
 * @openapi
 *  /business/create-and-add-service:
 *      post:
 *         summary: Create a business profile with billings services
 *         tags:
 *            - Business
 *         parameters:
 *            - in: query
 *              name: customerId
 *              required: true
 *              schema:
 *                 type : string
 *            - in: query
 *              name: serviceCode
 *              required: true
 *              schema:
 *                 type : string
 *         security:
 *           - bearerAuth: []
 *         requestBody:
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                type: object
 *                properties:
 *                  email:
 *                    type: string
 *                    format: email
 *                    example: acmebis@yopmail.com
 *                  name:
 *                    type: string
 *                    description: business name
 *         responses:
 *           "201":
 *             description: Business profile with billings created successfully
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
 * /business/edit:
 *   patch:
 *     summary: Update business profile information
 *     tags:
 *       - Business
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 description: Updated business address
 *     responses:
 *       "200":
 *         description: Business profile updated successfully
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
 *                   example: "Business profile updated successfully"
 *       "400":
 *         description: Bad Request - Invalid input data
 *       "401":
 *         description: Unauthorized - Invalid or missing token
 *       "404":
 *         description: Not Found - Business profile not found
 */

/**
 * @openapi
 * /business/logo-upload:
 *   put:
 *     summary: Upload business logo
 *     tags:
 *       - Business
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
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
 * /business/add-tap-key:
 *   put:
 *     summary: Add Tap payment key
 *     tags:
 *       - Business
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tap payments configuration complete
 */

/**
 * @openapi
 * /business/set-default-currency:
 *   put:
 *     summary: Set business default currency
 *     tags:
 *       - Business
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              currency:
 *                 type: string
 *                 enum : ["KWD", "USD", "GHS", "EUR"]
 *     responses:
 *       200:
 *         description: Business currency added
 */


/**
 * @openapi
 * /business/enable-tap-payment:
 *   post:
 *     summary: Enable or disable Tap payment for a business
 *     tags:
 *       - Business
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: enable
 *         required: true
 *         schema:
 *           type: boolean
 *         description: Set to true to enable, false to disable Tap payment.
 *     responses:
 *       200:
 *         description: Tap payment enabled or disabled successfully
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
 *                   example: Tap payment enabled successfully
 *                 data:
 *                   type: null
 */