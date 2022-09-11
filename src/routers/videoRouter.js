import express from 'express';
import {
  getRecorder,
  getUpload,
  postUpload,
  watchVideo,
  getEditVideo,
  postEditVideo,
  deleteVideo,
} from '../controllers/videoController';
import { protectOnly, multerVideo } from '../middlewares';

const videoRouter = express.Router();

videoRouter.route('/recorder').all(protectOnly).get(getRecorder);
videoRouter
  .route('/upload')
  .all(protectOnly)
  .get(getUpload)
  .post(
    multerVideo.fields([
      { name: 'video', maxCount: 1 },
      { name: 'thumb', maxCount: 1 },
    ]),
    postUpload
  );
videoRouter.route('/:id([0-9a-f]{24})').get(watchVideo);
videoRouter
  .route('/:id([0-9a-f]{24})/edit')
  .all(protectOnly)
  .get(getEditVideo)
  .post(multerVideo.single('thumb'), postEditVideo);
videoRouter
  .route('/:id([0-9a-f]{24})/delete')
  .all(protectOnly)
  .get(deleteVideo);

export default videoRouter;
