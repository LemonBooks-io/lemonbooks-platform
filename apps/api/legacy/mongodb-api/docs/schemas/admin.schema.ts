/**
 * @openapi
 * components:
 *   schemas:
 *     AdminCreation:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - role
 *         - permissionSet
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Admin's email address
 *           example: admin@example.com
 *         name:
 *           type: string
 *           description: Admin's full name
 *           example: John Doe
 *         role:
 *           type: string
 *           description: Admin's role in the system
 *           example: Admin
 *         accountType:
 *           type: string
 *         permissionSet:
 *           type: array
 *           items:
 *             type: string
 *           description: List of permissions granted to the admin
 *           example: ["Create Admin", "View Admin", "Create Business"]
 */