// /**
//  * @openapi
//  * /admin/create:
//  *      post:
//  *         summary: Create an admin account, this will only be done with an admin with required permission and a super admin.
//  *         tags:
//  *            - Admin @deprecating soon
//  *         security:
//  *           - bearerAuth: []
//  *         requestBody:
//  *              required: true
//  *              content:
//  *                  application/json:
//  *                     schema:
//  *                        $ref: '#/components/schemas/AdminCreation'
//  *         responses:
//  *           "201":
//  *             description: Admin account created successfully
//  *             content:
//  *               application/json:
//  *                 schema:
//  *                   type: object
//  *                   properties:
//  *                     success:
//  *                       type: boolean
//  *                       example: true
//  *                     message:
//  *                       type: string
//  *                       example: "Account created, please check email for credentials"
//  *                     data:
//  *                       type: null
//  *                       example: null
//  *           "400":
//  *             description: Bad Request - Invalid input data
//  *           "401":
//  *             description: Unauthorized - Invalid or missing token
//  *           "409":
//  *             description: Conflict - Admin account already exists with this email
//  */



// /**
//  * @openapi
//  * /admin/permissions:
//  *      get:
//  *         tags:
//  *            - Admin @deprecating soon
//  *         responses:
//  *           "200":
//  *             description: success
//  *             content:
//  *               application/json:
//  *                 schema:
//  *                   type: object
//  *                   properties:
//  *                     success:
//  *                       type: boolean
//  *                       example: true
//  *                     message:
//  *                       type: string
//  *                       example: "Fetched Permissions"
//  *                     data:
//  *                      type: array
//  *                      items:
//  *                        type: object
//  *                        properties:
//  *                          permission:
//  *                            type: string
//  *                            example : "Create Admin"
//  *                          target:
//  *                            type: string
//  *                            example : "Generic"
//  */

// /**
//  * @openapi
//  * /admin/profile:
//  *      get:
//  *         tags:
//  *            - Admin @deprecating soon
//  *         responses:
//  *           "200":
//  *             description: success
//  *             content:
//  *               application/json:
//  *                 schema:
//  *                   type: object
//  *                   properties:
//  *                     success:
//  *                       type: boolean
//  *                       example: true
//  *                     message:
//  *                       type: string
//  *                       example: "Admin profile fetched"
//  */


// /**
//  * @openapi
//  * /admin/all:
//  *      get:
//  *         tags:
//  *            - Admin @deprecating soon
//  *         responses:
//  *           "200":
//  *             description: success
//  *             content:
//  *               application/json:
//  *                 schema:
//  *                   type: object
//  *                   properties:
//  *                     success:
//  *                       type: boolean
//  *                       example: true
//  *                     message:
//  *                       type: string
//  *                       example: "Users fetched"
//  */