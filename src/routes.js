import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import User from './app/models/User';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import SignatureController from './app/controllers/SignatureController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import ScheduleController from './app/controllers/ScheduleController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

routes.post('/sessions', SessionController.store);

routes.get('/schedule', ScheduleController.index);

routes.use(authMiddleware);

routes.get('/delivery', DeliverymanController.index);

routes.get('/deliveries', DeliveryController.index);

routes.post('/recipients', RecipientController.store);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/signatures', upload.single('file'), SignatureController.store);

routes.post('/delivery', DeliverymanController.store);

routes.post('/deliveries', DeliveryController.store);

routes.put('/deliveries', DeliveryController.update);

routes.delete('/deliveries', DeliveryController.delete);

export default routes;
