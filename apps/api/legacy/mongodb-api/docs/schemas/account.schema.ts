/**
 * @openapi
 * components:
 *   schemas:
 *     UserCreation:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: user@example.com
 *         name:
 *           type: string
 *           description: User's full name
 *           example: John Doe
 *         role:
 *           type: string
 *           description: User's role in the system
 *           example: User
 *         phone : 
 *           type : object
 *           properties:
 *             countryCode:
 *                 type: string
 *             number:
 *                 type: string
 * 
 */

/**
 * @openapi
 * components:
 *    schemas:
 *       BulkUpload:
 *          type: object
 *          properties:
 *             csv:
 *                type: string
 *                format: binary
 *                description: CSV file for bulk data upload
 */
