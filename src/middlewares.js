import multer from 'multer';

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedInUser = req.session.user || {};
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = 'JHTube';
  next();
};

export const publicOnly = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash('error', 'Not Authorized.');
    return res.redirect('/');
  }
};

export const protectOnly = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash('error', 'Not Authorized.');
    return res.redirect('/login');
  }
};

export const multerVideo = multer({
  dest: 'uploads/videos/',
  limits: { fileSize: 1000000000 },
});

export const multerAvatar = multer({
  dest: 'uploads/avatars/',
  limits: { fileSize: 15730000 },
});
