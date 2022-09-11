import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const video = document.querySelector('#preview');
const actionBtn = document.querySelector('#startBtn');
const downloadBtn = document.querySelector('#downloadBtn');

let stream;
let recorder;
let videoUrl;

const handleStart = () => {
  actionBtn.innerHTML = 'Stop recording';
  actionBtn.removeEventListener('click', handleStart);
  actionBtn.addEventListener('click', handleStop);

  recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  recorder.ondataavailable = (event) => {
    videoUrl = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoUrl;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const handleStop = () => {
  actionBtn.innerHTML = 'Start recording';
  actionBtn.removeEventListener('click', handleStop);
  actionBtn.addEventListener('click', handleStart);
  downloadBtn.addEventListener('click', handleDownload);
  recorder.stop();
};

const downloadFile = (url, name) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  downloadBtn.removeEventListener('click', handleDownload);
  downloadBtn.innerHTML = 'Transcoding...';
  downloadBtn.disabled = true;

  const files = {
    input: `${recorder.stream.id}.webm`,
    output: `${recorder.stream.id}.mp4`,
    thumbnail: `${recorder.stream.id}.jpg`,
  };

  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  ffmpeg.FS('writeFile', files.input, await fetchFile(videoUrl));
  await ffmpeg.run('-i', files.input, '-r', '60', files.output);
  await ffmpeg.run(
    '-i',
    files.input,
    '-ss',
    '00:00:01',
    '-frames:v',
    '1',
    files.thumbnail
  );

  const mp4File = ffmpeg.FS('readFile', files.output);
  const thumbFile = ffmpeg.FS('readFile', files.thumbnail);
  const mp4Blob = new Blob([mp4File.buffer], { type: 'video/mp4' });
  const thumbBlob = new Blob([thumbFile.buffer], { type: 'image/jpg' });
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, files.output);
  downloadFile(thumbUrl, files.thumbnail);

  ffmpeg.FS('unlink', files.input);
  ffmpeg.FS('unlink', files.output);
  ffmpeg.FS('unlink', files.thumbnail);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoUrl);

  const tracks = stream.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });
  stream = null;

  downloadBtn.disabled = false;
  downloadBtn.innerHTML = 'Download';
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: 1024,
      height: 576,
    },
  });
  video.srcObject = stream;
  video.play();
};

init();

actionBtn.addEventListener('click', handleStart);
