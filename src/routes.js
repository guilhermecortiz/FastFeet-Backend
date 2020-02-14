import { Router } from 'express';
import User from './app/models/User';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', .store);

export default routes;
