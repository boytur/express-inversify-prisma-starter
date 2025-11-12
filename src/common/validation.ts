import { NextFunction, Request, Response } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate =
  (schema: ZodObject<any, any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(error.format());
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
