import { Router } from 'express';
import multer from 'multer';

import {
  AppointmentController,
  AvailableController,
  FileController,
  NotificationController,
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
routes.get('/providers/:providerId', AvailableController.index);

routes.get('/appointments', AppointmentController.index);
routes.post('/appointments', AppointmentController.store);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
