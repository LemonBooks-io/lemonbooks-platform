
/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login as an admin user
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: header
 *         name: X-Tenant-Id
 *         required: true
 *         schema:
 *           type: string
 *           example : "administrator"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: superadmin@yopmail.com
 *               password:
 *                 type: string
 *                 description: Admin's password
 *                 example: "admin001"
 *                 
 *     responses:
 *       "200":
 *         description: Login successful
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
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                      loginType:
 *                         type : string 
 *                         example : LOGIN_SUCCESS or MFA_REQUIRED
 *                      authToken:
 *                         type: object
 *                         properties:
 *                           token:
 *                             type: string
 *                           expiresIn:
 *                             type: number
 *                           type:
 *                             type: string
 *                             description: identify if token is a shortlived or long lived token.(AUTH,TEMPORARY)
 *                      role: 
 *                        type: string
 *                      accountType:
 *                        type: string
 *       "400":
 *         description: Bad Request - Invalid input data
 *       "401":
 *         description: Unauthorized - Invalid credentials
 *       "404":
 *         description: Not Found - Admin account not found
 */


/**
 * @openapi
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to user's email
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: header
 *         name: X-Tenant-Id
 *         required: true
 *         schema:
 *           type: string 
 *           example : "administrator"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *       400:
 *         description: Bad request, validation error
 *       404:
 *         description: User not found
 *
 */

/**
 * @openapi
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP sent to user's email
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: header
 *         name: X-Tenant-Id
 *         required: true
 *         schema:
 *           type: string
 *           example : "administrator"
 *       - in: query
 *         name: rememberDevice
 *         schema:
 *           type: boolean
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               email:
 *                 type: string
 *             required:
 *               - otp
 *               - email
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP verified successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     expiresIn:
 *                       type: number
 *                     type:
 *                       type: string
 *       400:
 *         description: Bad request, validation error
 *       404:
 *         description: Invalid or expired OTP
 *
 */
 


/**
 * @openapi
 * /auth/change-password:
 *   patch:
 *     summary: Change user's password
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: "NewStrongPassword123"
 *             required:
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *                 data:
 *                   type: null
 *       400:
 *         description: Bad request, validation error
 *       401:
 *         description: Unauthorized, invalid or missing token
 */


/**
 * @openapi 
 * /auth/customer/login:
 *   post:
 *     summary: Login as a customer
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: header
 *         name: X-Tenant-Id
 *         required: true
 *         schema:
 *           type: string
 *           example: "tenant123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: customer@example.com
 *               password:
 *                 type: string
 *                 description: Customer's password
 *                 example: "password123"
 *     responses:
 *       "200":
 *         description: Login successful
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
 *                   example: "Customer authentication successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                      loginType:
 *                         type: string 
 *                         example: LOGIN_SUCCESS
 *                      authToken:
 *                         type: object
 *                         properties:
 *                           token:
 *                             type: string
 *                           expiresIn:
 *                             type: number
 *                           type:
 *                             type: string
 *                             description: Token type (AUTH)
 *                      customer:
 *                        type: object
 *                        properties:
 *                          id:
 *                            type: string
 *                          email:
 *                            type: string
 *                          businessId:
 *                            type: string
 *                          accountType:
 *                            type: string
 *                      tenantId:
 *                        type: string
 *       "400":
 *         description: Bad Request - Invalid input data
 *       "401":
 *         description: Unauthorized - Invalid credentials
 *       "404":
 *         description: Not Found - Customer account not found
 */




/**
 * @openapi
 * /auth/customer/change-password:
 *   patch:
 *     summary: Change user's password
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: header
 *         name: X-Tenant-Id
 *         required: true
 *         schema:
 *           type: string
 *           example: "tenant123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: "NewStrongPassword123"
 *             required:
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *                 data:
 *                   type: null
 *       400:
 *         description: Bad request, validation error
 *       401:
 *         description: Unauthorized, invalid or missing token
 */


/**
 * @openapi
 * /auth/customer/reset-password:
 *   post:
 *     summary: Reset customer's password
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: header
 *         name: X-Tenant-Id
 *         required: true
 *         schema:
 *           type: string
 *           example: "tenant123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "customer@example.com"
 *             required:
 *               - email
 *     responses:
 *      200:
 *         description: Password reset initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Customer password reset initiated successfully"
 *                 data:
 *                   type: null
 *      400:
 *         description: Bad request, validation error
 *      404:
 *         description: Customer not found
 */


/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset user's password
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: header
 *         name: X-Tenant-Id
 *         required: true
 *         schema:
 *           type: string
 *           example: "administrator"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *             required:
 *               - email
 *     responses:
 *      200:
 *         description: Password reset initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User password reset initiated successfully"
 *                 data:
 *                   type: null
 *      400:
 *         description: Bad request, validation error
 *      404:
 *         description: Customer not found
 */