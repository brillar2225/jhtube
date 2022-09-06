import express from 'express';
import {
  registerView,
  createComment,
  editComment,
  deleteComment,
} from '../controllers/videoController';
import { protectOnly } from '../middlewares';

const apiRouter = express.Router();

apiRouter.route('/videos/:id([0-9a-f]{24})/view').post(registerView);
apiRouter
  .route('/videos/:id([0-9a-f]{24})/comments')
  .all(protectOnly)
  .post(createComment);
apiRouter
  .route('/videos/:id([0-9a-f]{24})/comments/:commentId([0-9a-f]{24})/edit')
  .all(protectOnly)
  .post(editComment);
apiRouter
  .route('/videos/:id([0-9a-f]{24})/comments/:commentId([0-9a-f]{24})/delete')
  .all(protectOnly)
  .delete(deleteComment);

export default apiRouter;
