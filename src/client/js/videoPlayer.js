const videoBox = document.querySelector('#videoBox');
const video = document.querySelector('video');
const controller = document.querySelector('#videoController');

const playBtn = document.querySelector('#playBtn');
const playBtnIcon = playBtn.querySelector('i');
const time = document.querySelector('#videoTime');
const current = document.querySelector('#currentTime');
const total = document.querySelector('#totalTime');
const timeline = document.querySelector('#timeline');
const volume = document.querySelector('#volume');
const muteBtn = document.querySelector('#muteBtn');
const volRange = document.querySelector('#volRange');
const muteBtnIcon = muteBtn.querySelector('i');

const fullScreen = document.querySelector('#fullScreen');
const fullScreenIcon = fullScreen.querySelector('i');

let timeoutId = null;
let moveTimeoutId = null;
let volValue = 0.5;
video.volume = volValue;

// global func
const makeFull = () => {
  videoBox.requestFullscreen();
  fullScreenIcon.classList = 'fa-solid fa-compress';
};

const exitFull = () => {
  document.exitFullscreen();
  fullScreenIcon.classList = 'fa-solid fa-expand';
};

// handle func
const handlePlay = () => {
  if (video.paused) {
    playBtn.title = 'Pause(k)';
    video.play();
  } else {
    playBtn.title = 'Play(k)';
    video.pause();
  }
  playBtnIcon.classList = video.paused
    ? 'fa-solid fa-play'
    : 'fa-solid fa-pause';
};

const handleMute = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }

  muteBtnIcon.classList = video.muted
    ? 'fa-solid fa-volume-xmark'
    : 'fa-solid fa-volume-low';
  volRange.value = video.muted ? 0 : volValue;
};

const handleVolumeRange = (event) => {
  const {
    target: { value },
  } = event;
  // change the icon for each value
  if (value === '0') {
    muteBtnIcon.classList = 'fa-solid fa-volume-xmark';
  } else if (value < '0.5') {
    muteBtnIcon.classList = 'fa-solid fa-volume-low';
  } else if (value >= '0.5') {
    muteBtnIcon.classList = 'fa-solid fa-volume-high';
  }

  if (video.muted) {
    video.muted = false;
    muteBtnIcon.classList = 'fa-solid fa-volume-xmark';
  }
  video.volume = value;
  volValue = value;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(14, 19);

const handleLoadedMetadata = () => {
  total.innerHTML = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  current.innerHTML = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimeline = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleKeydown = (event) => {
  if (event.target.tagName !== 'TEXTAREA') {
    switch (event.keyCode) {
      case 32:
        event.preventDefault();
        handlePlay();
        break;
      case 75:
        event.preventDefault();
        handlePlay();
        break;
      case 37:
        event.preventDefault();
        timeline.value = Math.floor(video.curreentTime - 5);
        video.currentTime = timeline.value;
        break;
      case 39:
        event.preventDefault();
        timeline.value = Math.floor(video.curreentTime + 5);
        video.currentTime = timeline.value;
        break;
      case 70:
        event.preventDefault();
        makeFull();
        break;
      case 27:
        event.preventDefault();
        exitFull();
        break;
      case 77:
        event.preventDefault();
        handleMute();
        break;
    }
  }
};

const handleClickScreen = () => {
  handlePlay();
};

const handleEnded = () => {
  const { id } = videoBox.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: 'POST',
  });
};

const handleFullscreen = () => {
  const ele = document.fullscreenElement;
  if (ele) {
    exitFull();
  } else {
    makeFull();
  }
};

const hideControls = () => controller.classList.remove('active');

const showVolController = () => {
  volume.classList.toggle('active');
  volRange.classList.toggle('active');
};

const handleMousemove = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  if (moveTimeoutId) {
    clearTimeout(moveTimeoutId);
    moveTimeoutId = null;
  }
  controller.classList.add('active');
  moveTimeoutId = setTimeout(hideControls, 2000);
};

const handleMouseleave = () => {
  timeoutId = setTimeout(hideControls, 2000);
};

playBtn.addEventListener('click', handlePlay);
muteBtn.addEventListener('click', handleMute);
volRange.addEventListener('input', handleVolumeRange);
video.readyState
  ? handleLoadedMetadata()
  : video.addEventListener('loadedmetadata', handleLoadedMetadata);
video.addEventListener('timeupdate', handleTimeUpdate);
video.addEventListener('ended', handleEnded);
video.addEventListener('timeupdate', handleTimeUpdate);
video.addEventListener('click', handleClickScreen);
video.addEventListener('ended', handleEnded);
window.addEventListener('keydown', handleKeydown);
fullScreen.addEventListener('click', handleFullscreen);
timeline.addEventListener('input', handleTimeline);
muteBtn.addEventListener('mouseover', showVolController);
videoBox.addEventListener('mousemove', handleMousemove);
videoBox.addEventListener('mouseleave', handleMouseleave);
