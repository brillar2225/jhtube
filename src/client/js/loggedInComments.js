const videoBox = document.querySelector('#videoBox');
const form = document.querySelector('#commentForm');
const menuBtn = document.querySelectorAll('.video__comments__menuBtn');
const editBtn = document.querySelectorAll('.video__comments__editBtn');
const deletBtn = document.querySelectorAll('.video__comments__deleteBtn');
const editForm = document.querySelectorAll('.video__comments__infos > form');

const showMenubar = (event) => {
  const target = event.target.parentNode.previousElementSibling;
  target.classList.toggle('active');
};

const handleForm = (event) => {
  const target = event.target.parentNode.previousElementSibling;
  const text = target.querySelector('.video__comments__text');
  const form = target.querySelector('.video__comments__edit__form');
  const textarea = form.querySelector('.video__comments__edit__textarea');
  textarea.value = text.innerHTML;
  text.classList.toggle('active');
  form.classList.toggle('active');
};

const addComment = (text, id, createdAt, user) => {
  const videoComments = document.querySelector('.video__comments__ul');

  const newComment = document.createElement('li');
  newComment.className = 'video__comments__li';
  newComment.dataset.id = id;

  const newCommentLink = document.createElement('a');
  const newCommentAvatar = document.createElement('img');
  newCommentLink.className = 'video__comments__link';
  newCommentAvatar.className = 'video__comments__avatar';
  newCommentLink.href = `/users/${user._id}`;
  newCommentAvatar.src =
    user.socialLogin !== false ? user.avatarUrl : '/' + user.avatarUrl;

  const newCommentInfos = document.createElement('div');
  const newCommentContent = document.createElement('div');
  const newCommentNickname = document.createElement('h4');
  const newCommentCreatedAt = document.createElement('span');
  const newCommentText = document.createElement('h5');
  const newCommentForm = document.createElement('form');
  const newCommentTextarea = document.createElement('textarea');
  const newCommentSendBtn = document.createElement('button');
  newCommentInfos.className = 'video__comments__infos';
  newCommentContent.className = 'video__comments__content';
  newCommentNickname.className = 'video__comments__nickname';
  newCommentCreatedAt.className = 'video__comments__createdAt';
  newCommentText.className = 'video__comments__text';
  newCommentForm.className = 'video__comments__edit__form';
  newCommentTextarea.className = 'video__comments__edit__textarea';
  newCommentSendBtn.className = 'video__comments__edit__sendBtn';
  newCommentNickname.innerHTML = user.nickname;
  newCommentCreatedAt.innerHTML = new Date(createdAt).toLocaleString('en-KR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  newCommentText.innerHTML = text;
  newCommentTextarea.value = text;
  newCommentSendBtn.innerHTML = 'Send';
  newCommentForm.addEventListener('submit', handleEdit);

  const newCommentMenubar = document.createElement('div');
  const newCommentEditMenu = document.createElement('button');
  const newCommentDeleteMenu = document.createElement('button');
  newCommentMenubar.className = 'video__comments__menubar';
  newCommentEditMenu.className = 'video__comments__menu';
  newCommentDeleteMenu.className = 'video__comments__menu';
  newCommentEditMenu.classList.add('video__comments__editBtn');
  newCommentDeleteMenu.classList.add('video__comments__deleteBtn');
  newCommentEditMenu.innerHTML = 'Edit';
  newCommentDeleteMenu.innerHTML = 'Delete';
  newCommentEditMenu.addEventListener('click', handleForm);
  newCommentDeleteMenu.addEventListener('click', handleDelete);

  const newCommentMenuBtn = document.createElement('div');
  const newCommentMenuBtnIcon = document.createElement('i');
  newCommentMenuBtn.className = 'video__comments__menuBtn';
  newCommentMenuBtnIcon.className = 'fa-solid fa-ellipsis-vertical';
  newCommentMenuBtn.addEventListener('click', showMenubar);

  newCommentContent.appendChild(newCommentNickname);
  newCommentContent.appendChild(newCommentCreatedAt);
  newCommentForm.appendChild(newCommentTextarea);
  newCommentForm.appendChild(newCommentSendBtn);

  newCommentLink.appendChild(newCommentAvatar);
  newCommentInfos.appendChild(newCommentContent);
  newCommentInfos.appendChild(newCommentText);
  newCommentInfos.appendChild(newCommentForm);
  newCommentMenubar.appendChild(newCommentEditMenu);
  newCommentMenubar.appendChild(newCommentDeleteMenu);
  newCommentMenuBtn.appendChild(newCommentMenuBtnIcon);

  newComment.appendChild(newCommentLink);
  newComment.appendChild(newCommentInfos);
  newComment.appendChild(newCommentMenubar);
  newComment.appendChild(newCommentMenuBtn);

  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = document.querySelector('#commentTextarea');
  const text = textarea.value;
  const videoId = videoBox.dataset.id;
  if (text === '' || text.trim() === '') {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = '';
    const { newCommentId, newCommentCreatedAt, user } = await response.json();
    addComment(text, newCommentId, newCommentCreatedAt, user);
  }
};

const editComment = (text, commentLi) => {
  const comment = commentLi.querySelector('.video__comments__infos h5');
  const form = commentLi.querySelector('.video__comments__infos form');

  comment.innerHTML = text;
  comment.classList.remove('active');
  form.classList.remove('active');
};

const handleEdit = async (event) => {
  event.preventDefault();
  const commentLi = event.target.closest('.video__comments__li');
  const videoId = videoBox.dataset.id;
  const commentId = commentLi.dataset.id;
  const textarea = commentLi.querySelector('.video__comments__infos textarea');
  const text = textarea.value;
  if (text === '' || text.trim() === '' || text === textarea.innerHTML) {
    return;
  }
  const response = await fetch(
    `/api/videos/${videoId}/comments/${commentId}/edit`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    }
  );
  if (response.status === 200) {
    editComment(text, commentLi);
  }
};

const handleDelete = async (event) => {
  const comment = event.target.closest('.video__comments__li');
  const videoId = videoBox.dataset.id;
  const commentId = comment.dataset.id;
  const response = await fetch(
    `/api/videos/${videoId}/comments/${commentId}/delete`,
    {
      method: 'DELETE',
    }
  );
  if (response.status === 201) {
    comment.remove();
  }
};

form.addEventListener('submit', handleSubmit);
if (menuBtn) {
  menuBtn.forEach((btn) => btn.addEventListener('click', showMenubar));
  editBtn.forEach((btn) => btn.addEventListener('click', handleForm));
  deletBtn.forEach((btn) => btn.addEventListener('click', handleDelete));
  editForm.forEach((form) => form.addEventListener('submit', handleEdit));
}
