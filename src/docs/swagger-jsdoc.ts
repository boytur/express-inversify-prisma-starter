// swagger-jsdoc does not yet have types in this project; require dynamically
const swaggerJSDoc = require('swagger-jsdoc');
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express Inversify Prisma Starter',
      version: '1.0.0',
    },
  },
  apis: [path.join(__dirname, '..', 'modules', '**', '*.ts'), path.join(__dirname, '**', '*.ts')],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
