import express from 'express';
import {
  startGithubLogin,
  finishGithubLogin,
  startKakaoLogin,
  finishKakaoLogin,
  logout,
  getPassword,
  postPassword,
  profile,
  getEditAccount,
  postEditAccount,
} from '../controllers/userController';
import { publicOnly, protectOnly, multerAvatar } from '../middlewares';

const userRouter = express.Router();

userRouter.route('/github/start').all(publicOnly).get(startGithubLogin);
userRouter.route('/github/finish').all(publicOnly).get(finishGithubLogin);
userRouter.route('/kakao/start').all(publicOnly).get(startKakaoLogin);
userRouter.route('/kakao/finish').all(publicOnly).get(finishKakaoLogin);
userRouter.route('/logout').all(protectOnly).get(logout);
userRouter.route('/:id([0-9a-f]{24})').get(profile);
userRouter
  .route('/:id([0-9a-f]{24})/my-account')
  .all(protectOnly)
  .get(getEditAccount)
  .post(multerAvatar.single('avatar'), postEditAccount);
userRouter
  .route('/:id([0-9a-f]{24})/my-account/password')
  .all(protectOnly)
  .get(getPassword)
  .post(postPassword);

export default userRouter;
