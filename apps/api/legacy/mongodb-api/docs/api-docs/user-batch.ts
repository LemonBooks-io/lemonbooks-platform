/**
 * @openapi
 * /user/batch:
 *   post:
 *     summary: Batch fetch users by array of IDs
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs
 *     responses:
 *       200:
 *         description: Batch users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BatchUserDTO'
 *       400:
 *         description: Bad request if ids is not a non-empty array
 *       401:
 *         description: Unauthorized
 *
 * components:
 *   schemas:
 *     BatchUserDTO:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         businessId:
 *           type: string
 *         tenantId:
 *           type: string
 */
