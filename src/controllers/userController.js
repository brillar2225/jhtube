import User from '../models/User';
import Video from '../models/Video';
import fetch from 'node-fetch';
import bcrypt from 'bcrypt';

export const getJoin = (req, res) => {
  return res.render('users/join', { pageTitle: 'Join' });
};

export const postJoin = async (req, res) => {
  const {
    body: { username, email, nickname, password, password2, location },
    file: { path: avatarUrl },
  } = req;
  const pageTitle = 'Join';
  if (password !== password2) {
    return res.status(400).render('users/join', {
      pageTitle,
      errMsg: 'The password does not match. Please try again.',
    });
  }
  const isExist = await User.exists({ $or: [{ username }, { email }] });
  if (isExist) {
    return res.status(400).render('users/join', {
      pageTitle,
      errMsg: 'The username or e-mail is already existed.',
    });
  }
  try {
    await User.create({
      username,
      email,
      nickname,
      password: await User.hashPassword(password),
      location,
      avatarUrl,
    });
    req.flash('success', 'Succeed to sign-up. Login next.');
    return res.redirect('/login');
  } catch (error) {
    console.error(error);
    return res.status(400).render('users/join', {
      pageTitle,
      errMsg: error._message,
    });
  }
};

export const getLogin = (req, res) => {
  return res.render('users/login', { pageTitle: 'Login' });
};

export const postLogin = async (req, res) => {
  const pageTitle = 'Login';
  const {
    body: { username, password },
  } = req;
  const user = await User.findOne({ username, socialLogin: false });
  if (!user) {
    return res.status(400).render('users/login', {
      pageTitle,
      errMsg: 'The username does not exist. Please try again.',
    });
  }
  const comparePw = await bcrypt.compare(password, user.password);
  if (!comparePw) {
    return res.status(400).render('users/login', {
      pageTitle,
      errMsg: 'The password is incorrect. Please try again.',
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect('/');
};

export const startGithubLogin = (req, res) => {
  const baseUrl = 'https://github.com/login/oauth/authorize';
  const config = {
    client_id: process.env.GH_CLIENT,
    scope: 'read:user user:email',
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = 'https://github.com/login/oauth/access_token';
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })
  ).json();
  if ('access_token' in tokenRequest) {
    const apiUrl = 'https://api.github.com';
    const { access_token } = tokenRequest;
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect('/login');
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        username: userData.login,
        email: emailObj.email,
        nickname: userData.name,
        password: '',
        socialLogin: true,
        avatarUrl: userData.avatar_url,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect('/');
  } else {
    req.flash('error', 'Failed to login with Github. Try again.');
    return res.redirect('/login');
  }
};

export const startKakaoLogin = (req, res) => {
  const baseUrl = 'https://kauth.kakao.com/oauth/authorize';
  const config = {
    client_id: process.env.KA_CLIENT,
    redirect_uri: 'http://localhost:50000/users/kakao/finish',
    response_type: 'code',
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishKakaoLogin = async (req, res) => {
  const baseUrl = 'https://kauth.kakao.com/oauth/token';
  const config = {
    grant_type: 'authorization_code',
    client_id: process.env.KA_CLIENT,
    client_secret: process.env.KA_SECRET,
    redirect_uri: 'http://localhost:50000/users/kakao/finish',
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-type': ' application/x-www-form-urlencoded;charset=utf-8',
      },
    })
  ).json();
  if ('access_token' in tokenRequest) {
    const apiUrl = 'https://kapi.kakao.com';
    const { access_token } = tokenRequest;
    const userData = await (
      await fetch(`${apiUrl}/v2/user/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          'Access-Control-Allow-Origin': 'http://localhost:50000/',
        },
      })
    ).json();
    const { kakao_account } = userData;
    if (
      kakao_account.is_email_valid !== true &&
      kakao_account.is_email_verified !== true
    ) {
      return res.redirect('/login');
    }
    let user = await User.findOne({ email: kakao_account.email });
    if (!user) {
      user = await User.create({
        username: kakao_account.email,
        email: kakao_account.email,
        nickname: kakao_account.profile.nickname,
        password: '',
        socialLogin: true,
        avatarUrl: kakao_account.profile.profile_image_url,
        location: '',
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect('/');
  } else {
    req.flash('error', 'Failed to login with Kakao Talk. Try again.');
    return res.redirect('/login');
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

export const getPassword = (req, res) => {
  const {
    session: {
      user: { socialLogin },
    },
  } = req;
  if (socialLogin) {
    req.flash('error', 'Cannot change password with this account.');
  }
  return res.render('users/password', { pageTitle: 'Change Password' });
};

export const postPassword = async (req, res) => {
  const pageTitle = 'Change Password';
  const {
    session: {
      user: { _id },
    },
    body: { current, changed, confirm },
  } = req;
  let user = await User.findById(_id);
  const comparePw = await bcrypt.compare(current, user.password);
  if (!comparePw) {
    return res.status(400).render('users/password', {
      pageTitle,
      errMsg: 'The current password is incorrect.',
    });
  }
  if (changed !== confirm) {
    return res.status(400).render('users/password', {
      pageTitle,
      errMsg: 'The new password deos not match with the confirmation.',
    });
  }
  user = await User.findByIdAndUpdate(_id, {
    password: await User.hashPassword(changed),
  });
  req.session.destroy();
  req.flash('success', 'Succeed to change password.');
  return res.redirect('/login');
};

export const profile = async (req, res) => {
  const {
    params: { id },
  } = req;
  const user = await User.findById(id).populate({
    path: 'videos',
    populate: {
      path: 'owner',
      model: 'User',
    },
  });
  if (!user) {
    req.flash('error', 'Cannot find user&#39;s profile.');
    return res.status(404).redirect('/');
  }
  return res.render('users/profile', {
    pageTitle: `${user.nickname}'s profile`,
    user,
  });
};

export const getEditAccount = async (req, res) => {
  const {
    params: { id },
  } = req;
  const user = await User.findById(id);
  return res.render('users/myAccount', {
    pageTitle: `Edit ${user.nickname} account`,
  });
};

export const postEditAccount = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl, email: pastEmail, username: pastUsername },
    },
    body: { nickname, email, username, location },
    file,
  } = req;
  const pageTitle = `Edit ${req.session.user.nickname}'s profile`;

  if (pastEmail !== email) {
    const checkEmail = await User.exists({ email });
    if (checkEmail) {
      return res.status(400).render('users/myAccount', {
        pageTitle,
        errMsg: 'The E-Mail is already taken.',
      });
    }
  }

  if (pastUsername !== username) {
    const checkUsername = await User.exists({ username });
    if (checkUsername) {
      return res.status(400).render('users/myAccount', {
        pageTitle,
        errMsg: 'The username is already taken.',
      });
    }
  }

  const findSocialLogin = await User.findOne({ socialLogin: true });
  if (findSocialLogin && pastEmail !== email) {
    return res.status(400).render('users/myAccount', {
      pageTitle,
      errMsg: 'This ID using social media can not change the email.',
    });
  }

  const updateUserdata = await User.findByIdAndUpdate(
    _id,
    {
      nickname,
      email,
      username,
      avatarUrl: file ? file.path : avatarUrl,
      location,
    },
    { new: true }
  );
  req.session.user = updateUserdata;
  req.flash('success', 'Succeed to edit user account.');
  return res.redirect(`/users/${_id}/my-account`);
};
