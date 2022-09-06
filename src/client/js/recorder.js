const video = document.querySelector('#preview');
const startBtn = document.querySelector('#startBtn');
const downloadBtn = document.querySelector('#downloadBtn');

let stream;
let recorder;
let videoUrl;

const handleStart = () => {
  startBtn.innerHTML = 'Stop recording';
  startBtn.removeEventListener('click', handleStart);
  startBtn.addEventListener('click', handleStop);

  recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  recorder.ondataavailable = (event) => {
    videoUrl = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoUrl;
    video.play();
  };
  recorder.start();
};

const handleStop = () => {
  startBtn.innerHTML = 'Start recording';
  startBtn.removeEventListener('click', handleStop);
  startBtn.addEventListener('click', handleStart);
  downloadBtn.addEventListener('click', handleDownload);
  recorder.stop();
};

const handleDownload = () => {
  const a = document.createElement('a');
  a.href = videoUrl;
  a.download = 'recording.webm';
  document.body.appendChild(a);
  a.click();

  const tracks = stream.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });
  stream = null;
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener('click', handleStart);
