import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  title: { type: String, trim: true, maxLength: 40, required: true },
  desc: { type: String, trim: true, minLenth: 15, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
  },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
  ],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

videoSchema.static('formatHashtags', function (hashtags) {
  return hashtags
    .split(',')
    .map((word) => (word.startsWith('#') ? word : `#${word}`));
});

const Video = mongoose.model('Video', videoSchema);
export default Video;
