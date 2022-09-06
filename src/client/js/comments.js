const textarea = document.querySelector('#commentTextarea');
const editTextarea = document.querySelectorAll(
  '.video__comments__edit__textarea'
);
const btnGroup = document.querySelector('#btnGroup');
const exitBtn = document.querySelector('#exitBtn');

const showBtn = () => {
  btnGroup.classList.add('active');
};

const hideBtn = () => {
  btnGroup.classList.remove('active');
};

const resizeTextarea = () => {
  setTimeout(() => {
    textarea.style.overflow = 'scroll';
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.floor(textarea.scrollHeight) - 6}px`;
  }, 0);
};

const resizeEditTextarea = (event) => {
  const textarea = event.target;
  setTimeout(() => {
    textarea.style.overflow = 'scroll';
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.floor(textarea.scrollHeight) - 6}px`;
  }, 0);
};

textarea.addEventListener('keydown', resizeTextarea);
editTextarea.forEach((ele) =>
  ele.addEventListener('keydown', resizeEditTextarea)
);
textarea.addEventListener('focus', showBtn);
exitBtn.addEventListener('click', hideBtn);
