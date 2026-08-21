/**
 * @openapi
 * /category/create:
 *   post:
 *     summary: Create a new category
 *     tags:
 *       - Category & Offerings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *               description:
 *                 type: string
 *                 example: All items electronic
 *     responses:
 *       200:
 *         description: Category created successfully
 *         content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                     name:
 *                       type: string
 *                     businessId:
 *                       type: string
 */

/**
 * @openapi
 * /category/all:
 *   get:
 *     summary: Get all categories
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
 *     responses:
 *       200:
 *        description: Categories fetched
 */


/**
 * @openapi
 * /category/edit/{categoryId}:
 *   patch:
 *     summary: Edit an existing category
 *     tags:
 *       - Category & Offerings
 *     parameters:
 *       - in: path
 *         name: categoryId
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
 *               categoryName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 */

/**
 * @openapi
 * /category/bulk:
 *      post:
 *         summary: Bulk create new categories from csv
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