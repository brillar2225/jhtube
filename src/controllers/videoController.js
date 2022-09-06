import Video from '../models/Video';
import User from '../models/User';
import Comment from '../models/Comment';

export const home = async (req, res) => {
  try {
    const videos = await Video.find({})
      .sort({ createdAt: 'desc' })
      .populate('owner');
    return res.render('home', { pageTitle: 'Home', videos });
  } catch (err) {
    console.error('🚫 Not Found', err);
    return res.status(404).redirect('/');
  }
};

export const search = async (req, res) => {
  const {
    query: { keywords },
  } = req;
  let videos = [];
  try {
    videos = await Video.find({
      $or: [
        {
          title: {
            $regex: new RegExp(keywords, 'ig'),
          },
        },
        {
          desc: {
            $regex: new RegExp(keywords, 'ig'),
          },
        },
        {
          hashtags: {
            $in: [new RegExp(keywords, 'ig')],
          },
        },
      ],
    }).populate('owner');
    return res.render('videos/search', {
      pageTitle: 'Search',
      videos,
      keywords,
    });
  } catch (err) {
    console.error('🚫 Not Found', err);
    return res.status(404).redirect('/');
  }
};

export const getRecorder = (req, res) => {
  return res.render('videos/recorder', { pageTitle: 'Video Recorder' });
};

export const postRecorder = (req, res) => {
  return res.send('post record');
};

export const getUpload = (req, res) => {
  return res.render('videos/upload', { pageTitle: 'Upload' });
};

export const postUpload = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    file: { path: fileUrl },
    body: { title, desc, hashtags },
  } = req;
  try {
    const newVideo = await Video.create({
      title,
      desc,
      hashtags: Video.formatHashtags(hashtags),
      fileUrl,
      owner: _id,
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect('/');
  } catch (err) {
    console.error(err);
    return res.status(404).render('videos/upload', {
      pageTitle: 'Upload Video',
      errMsg: err._message,
    });
  }
};

export const watchVideo = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await Video.findById(id)
    .populate('owner')
    .populate({
      path: 'comments',
      populate: {
        path: 'owner',
        model: 'User',
      },
    });
  if (!video) {
    req.flash('info', 'Videos not found.');
    return res.status(400).redirect('/');
  }
  const hashtags = video.hashtags.map((i) => i.replace('#', ''));
  return res.render('videos/watch', {
    pageTitle: `Watch ${video.title}`,
    video,
    hashtags,
  });
};

export const getEditVideo = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    req.flash('info', 'Videos not found.');
    return res.status(404).redirect(`/videos/${id}`);
  }
  if (String(video.owner) !== String(_id)) {
    req.flash('error', 'Not Authorized.');
    return res.status(401).redirect('/');
  }
  return res.render('videos/edit', {
    pageTitle: `Edit: ${video.title}`,
    video,
  });
};

export const postEditVideo = async (req, res) => {
  const {
    params: { id },
    body: { title, desc, hashtags },
    session: {
      user: { _id },
    },
  } = req;
  const video = await Video.findById({ _id: id });
  if (!video) {
    req.flash('info', 'Videos not found.');
    return res.status(404).redirect(`/videos/${id}`);
  }
  if (String(video.owner) !== String(_id)) {
    req.flash('error', 'Not Authorized. No access to edit this video.');
    return res.status(401).redirect('/');
  }
  await Video.findByIdAndUpdate(id, {
    title,
    desc,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash('success', 'Succeed to edit the video.');
  return res.redirect(`/videos/${id}`);
};

export const deleteVideo = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;
  const video = await Video.findById(id);
  const user = await User.findById(_id);
  if (!video) {
    req.flash('info', 'Videos not found.');
    return res.status(404).redirect(`/videos/${id}`);
  }
  if (String(video.owner) !== String(_id)) {
    req.flash('error', 'Not Authorized. No access to delete this video.');
    return res.status(403).redirect('/');
  }
  await Video.findByIdAndDelete(id);
  user.videos.splice(user.videos.indexOf(id), 1);
  user.save();
  return res.redirect('/');
};

export const registerView = async (req, res) => {
  const {
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  if (!user) {
    return res.status(401).redirect('/login');
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({
    newCommentId: comment._id,
    newCommentCreatedAt: comment.createdAt,
    user,
  });
};

export const editComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id, commentId },
  } = req;
  let comment = await Comment.findById(commentId).populate('owner');
  const video = await Video.findById(id).populate('comments');
  if (!video) {
    return res.sendStatus(404);
  }
  if (String(user._id) !== String(comment.owner._id)) {
    req.flash('error', 'Not Authorized. No access to edit this comment.');
    return res.status(403).redirect(`/videos/${id}`);
  }
  comment = await Comment.findByIdAndUpdate(commentId, { text }, { new: true });
  video.comments.splice(video.comments.indexOf(comment._id), 1, comment._id);
  video.save();
  return res.sendStatus(200);
};

export const deleteComment = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    params: { id, commentId },
  } = req;
  const comment = await Comment.findById(commentId).populate('owner');
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  if (String(_id) !== String(comment.owner._id)) {
    req.flash('error', 'Not Authorized. No access to delete this comment.');
    return res.status(403).redirect(`/videos/${id}`);
  }
  await Comment.findByIdAndDelete(commentId);
  video.comments.splice(video.comments.indexOf(commentId), 1);
  video.save();
  return res.sendStatus(201);
};
