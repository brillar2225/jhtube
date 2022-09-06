const searchInput = document.querySelector('#searchInput');
const searchBtn = document.querySelector('#searchBtn');
const menuBar = document.querySelector('#menuNav');
const menuBtn = document.querySelector('.fa-solid.fa-bars');

const handleSearch = () => {
  searchInput.classList.toggle('active');
  searchBtn.classList.toggle('active');
};

const handleMenu = () => {
  menuBar.classList.toggle('active');
};

searchBtn.addEventListener('click', handleSearch);
menuBtn.addEventListener('click', handleMenu);
