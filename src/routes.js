import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import User from './app/models/User';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import SignatureController from './app/controllers/SignatureController';
import CourierController from './app/controllers/CourierController';
import OrderController from './app/controllers/OrderController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.get('/couriers', CourierController.index);

routes.get('/orders', OrderController.index);

routes.post('/recipients', RecipientController.store);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/signatures', upload.single('file'), SignatureController.store);

routes.post('/couriers', CourierController.store);

routes.post('/orders', OrderController.store);

routes.put('/orders', OrderController.update);

routes.delete('/orders', OrderController.delete);

export default routes;
