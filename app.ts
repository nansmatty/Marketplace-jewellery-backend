import express, { NextFunction, Request, Response } from 'express';
require('dotenv').config();
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import { ErrorMiddleware } from './middlewares/errorMiddleware';
import { routes } from './routes';
import cookieParser from 'cookie-parser';
export const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());
app.use(helmet());

//morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/api/v1/health-check', (_req: Request, res: Response, _next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: 'API is working',
  });
});

// Routing files
routes(app);

//unknown route
app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
