/**
 * @openapi
 * components:
 *   schemas:
 *     CreateUser:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *         password:
 *           type: string
 *           minLength: 6
 *       required:
 *         - email
 *         - password
 *     LoginUser:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *       required:
 *         - email
 *         - password
 */

export {};
