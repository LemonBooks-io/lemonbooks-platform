/**
 * @openapi
 * /offerings/create:
 *   post:
 *     summary: Create a new product or service
 *     tags:
 *       - Category & Offerings
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: 
 *              - "SERVICE"
 *              - "PRODUCT"
 *           example: "SERVICE"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cost:
 *                 type: number
 *               description:
 *                 type: string
 *               serviceCycle:
 *                 type: object
 *                 properties:
 *                   unit:
 *                     type: number
 *                   duration:
 *                     type: string
 *               billingCycle:
 *                 type: object
 *                 properties:
 *                   unit:
 *                     type: number
 *                   duration:
 *                     type: string
 *               categoryId:
 *                 type: string

 *     responses:
 *       201:
 *         description: Offering created
 */

/**
 * @openapi
 * /offerings/all:
 *   get:
 *     summary: Get all offerings
 *     tags:
 *       - Category & Offerings
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
 *         name: isSystemService
 *         schema:
 *           type: string
 *           enum : [false, true]
 *     responses:
 *       200:
 *          description: Offerings fetched
 */

/**
 * @openapi
 * /offerings/{offeringId}:
 *   patch:
 *     summary: Edit an existing offering
 *     tags:
 *       - Category & Offerings
 *     parameters:
 *       - in: path
 *         name: offeringId
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Offering updated successfully
 */

/**
 * @openapi
 * /offerings/bulk:
 *      post:
 *         summary: Bulk create new offerings from csv
 *         tags:
 *            - Category & Offerings
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
 * /offerings/batch-fetch:
 *   post:
 *     summary: Batch fetch offerings by array of IDs
 *     tags:
 *       - Category & Offerings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offeringIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of offering IDs to fetch
 *                 example: ["64c6e8f2a1b2c3d4e5f6a7b8", "64c6e8f2a1b2c3d4e5f6a7b9"]
 *     responses:
 *       200:
 *         description: Batch offerings fetched
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
 */
