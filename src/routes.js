import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import { authMiddleware } from './app/middlewares';

const routes = new Router();

// create new user
routes.post('/users', UserController.store);

// create new session
routes.post('/sessions', SessionController.store);

// GLOBAL MIDDLEWARE: all routes below verify that the user is authenticated
routes.use(authMiddleware);

// update user
routes.put('/users', UserController.update);

export default routes;
