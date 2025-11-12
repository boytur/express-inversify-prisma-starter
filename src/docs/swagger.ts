import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import swaggerSpec from './swagger-jsdoc';

const swaggerOptions = {
  swaggerOptions: {
    url: '/swagger.json',
  },
};

const swaggerDocs = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(undefined, swaggerOptions));
  app.get('/swagger.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default swaggerDocs;
