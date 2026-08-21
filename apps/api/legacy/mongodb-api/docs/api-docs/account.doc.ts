/**
 * @openapi
 * /user/create:
 *      post:
 *         summary: Create an user account, this will only be done with an user with required permission and a super admin.
 *         tags:
 *            - User
 *         security:
 *           - bearerAuth: []
 *         requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                     schema:
 *                        $ref: '#/components/schemas/UserCreation'
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
 * /user/permissions:
 *      get:
 *         tags:
 *            - User
 *         responses:
 *           "200":
 *             description: success
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
 *                       example: "Fetched Permissions"
 *                     data:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          permission:
 *                            type: string
 *                            example : "Create Admin"
 *                          target:
 *                            type: string
 *                            example : "Generic"
 */

/**
 * @openapi
 * /user/profile:
 *      get:
 *         tags:
 *            - User
 *         responses:
 *           "200":
 *             description: success
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
 *                       example: "Admin profile fetched"
 */

/**
 * @openapi
 * /user/all:
 *      get:
 *         tags:
 *            - User
 *         parameters:
 *            - in: query
 *              name : offset
 *              default : 1
 *              required : true
 *              schema:
 *                 type: string
 *            - in: query
 *              name : limit
 *              default : 20
 *              schema:
 *                 type: string
 *         responses:
 *           "200":
 *             description: success
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
 *                       example: "Users fetched"
 */

/**
 * @openapi
 * /user/edit-profile:
 *      patch:
 *         summary: Edit user profile (name and phone number)
 *         tags:
 *            - User
 *         security:
 *           - bearerAuth: []
 *         requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                     schema:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         phone:
 *                           type: object
 *                           properties:
 *                             countryCode:
 *                               type: string
 *                               example: "+1"
 *                             number:
 *                               type: string
 *                               example: "1234567890"
 *         responses:
 *           "200":
 *             description: Profile updated successfully
 *           "400":
 *             description: Bad Request - Invalid input data
 *           "401":
 *             description: Unauthorized - Invalid or missing token
 *           "404":
 *             description: Not Found - User not found
 */

// /**
//  * @openapi
//  * /user/bulk:
//  *      post:
//  *         summary: Bulk create new users from csv
//  *         tags:
//  *            - User
//  *         requestBody:
//  *              required: true
//  *              content:
//  *                  multipart/form-data:
//  *                     schema:
//  *                        $ref: '#/components/schemas/BulkUpload'
//  *         responses:
//  *            "200":
//  *               description: success
//  */
