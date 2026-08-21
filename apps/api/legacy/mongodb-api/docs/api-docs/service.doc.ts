// /**
//  * @openapi
//  * /services/all:
//  *      get:
//  *         summary: Get all created service.
//  *         tags:
//  *            - Service
//  *         parameters:
//  *           - in: query
//  *             name: offset
//  *             required: true
//  *             default : 1
//  *             schema:
//  *               type: string 
//  *           - in: query
//  *             name: limit
//  *             schema:
//  *               type: string 
//  *         responses:
//  *           "200":
//  *             description: success
//  */

// /**
//  * @openapi
//  * /services/create:
//  *      post:
//  *         tags:
//  *            - Service
//  *         requestBody:
//  *              required: true
//  *              content:
//  *                  application/json:
//  *                     schema:
//  *                        $ref: '#/components/schemas/CreateService'
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
//  *                       example: "Service created"
//  *                     data:
//  *                       type: null
//  *                       example: null
//  */


// /**
//  * @openapi
//  * /services/getService/{serviceId}:
//  *      get:
//  *         summary: Get a service.
//  *         tags:
//  *            - Service
//  *         parameters:
//  *           - in: path
//  *             name: serviceId
//  *             required: true
//  *             schema:
//  *               type: string 
//  *         responses:
//  *           "200":
//  *             description: success
//  */


// /**
//  * @openapi
//  * /services/edit/{serviceId}:
//  *      patch:
//  *         tags:
//  *            - Service
//  *         parameters:
//  *           - in : path
//  *             name : serviceId
//  *             required: true
//  *             schema:
//  *               type : string
//  *         requestBody:
//  *              required: true
//  *              content:
//  *                  application/json:
//  *                     schema:
//  *                        $ref: '#/components/schemas/CreateService'
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
//  *                       example: "Service created"
//  *                     data:
//  *                       type: null
//  *                       example: null
//  */