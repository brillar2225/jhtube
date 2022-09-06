import express from 'express';
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from '../controllers/userController';
import { home, search } from '../controllers/videoController';
import { publicOnly, multerAvatar } from '../middlewares';

const rootRouter = express.Router();

rootRouter.route('/').get(home);
rootRouter.route('/result').get(search);
rootRouter
  .route('/join')
  .all(publicOnly)
  .get(getJoin)
  .post(multerAvatar.single('avatar'), postJoin);
rootRouter.route('/login').all(publicOnly).get(getLogin).post(postLogin);

export default rootRouter;
