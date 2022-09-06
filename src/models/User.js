import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  nickname: { type: String, required: true },
  password: String,
  socialLogin: { type: Boolean, default: false, required: true },
  avatarUrl: String,
  location: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
});

userSchema.static('hashPassword', async function (password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Hashed Password', hash);
  return hash;
});

const User = mongoose.model('User', userSchema);
export default User;
