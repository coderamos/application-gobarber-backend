import { Router } from 'express';
import multer from 'multer';

import {
  AppointmentController,
  FileController,
  ProviderController,
  ScheduleController,
  SessionController,
  UserController,
} from './app/controllers';
import { authMiddleware } from './app/middlewares';
import { multerConfig } from './config';

const upload = multer(multerConfig);
const routes = new Router();

routes.get('/users', UserController.index);
routes.post('/users', UserController.store);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);
routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);

routes.get('/appointments', AppointmentController.index);
routes.post('/appointments', AppointmentController.store);

routes.get('/schedule', ScheduleController.index);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
