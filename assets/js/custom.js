'use-strict';

///////////////////////////////////////////////
// MODAL

const allModals = document.querySelectorAll('.mb-modal');
const overlay = document.querySelector('.overlay');
const btnsCloseModal = document.querySelectorAll('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');

const openModal = function (e) {
  e.preventDefault();
  let modal = e.target.id;
  selectedModal = document.querySelector(`.${modal}`);
  selectedModal.classList.remove('mb-hidden');
  overlay.classList.remove('mb-hidden');
};

const closeModal = function (e) {
  let modal = e.target.id;
  selectedModal = document.querySelector(`.${modal}`);
  selectedModal.classList.add('mb-hidden');
  overlay.classList.add('mb-hidden');
};

const closeAllModals = function () {
  allModals.forEach((modal) => modal.classList.add('mb-hidden'));
  overlay.classList.add('mb-hidden');
};

btnsOpenModal.forEach((btn) => btn.addEventListener('click', openModal));
btnsCloseModal.forEach((btn) => btn.addEventListener('click', closeModal));
overlay.addEventListener('click', closeAllModals);

document.addEventListener('keydown', function (e) {
  allModals.forEach((modal) => {
    if (e.key === 'Escape' && !modal.classList.contains('mb-hidden')) {
      closeAllModals();
    }
  });
});

//////////////////////////////////////////////////
// DETECT SCROLL AND ADD WHITE BG TO NAV

const nav = document.querySelector('.navbar');

let scrollPos = window.scrollY;
const scrollLength = 1;

const onScrollAbove = () => {
  nav.classList.add('nav-bg');
  nav.classList.remove('bg-transparent');
};

const onScrollBelow = () => {
  nav.classList.remove('nav-bg');
  nav.classList.add('bg-transparent');
};

window.addEventListener('scroll', function () {
  scrollPos = window.scrollY;

  if (scrollPos > scrollLength) {
    onScrollAbove();
  } else {
    onScrollBelow();
  }
});

///////////////////////////////////////////////
// REVEAL SECTIONS WITH TRANSITION

const allSections = document.querySelectorAll('.section');

const revealSection = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add('section--hidden');
});

//////////////////////////////////////////////////
// GALLERY DRAG AND SCROLL

const scroller = document.querySelector('.gallery__wrapper__images');
const imageBox = document.querySelectorAll('.gallery__wrapper__images__box');

let isGrabbed = false;
let initialPos;
let scrollTop;

const initializeDrag = (e) => {
  scroller.classList.add('active');
  imageBox.forEach((box) => {
    box.classList.add('shadow');
  });

  isGrabbed = true;
  initialPos = e.pageY - scroller.offsetTop;
  scrollTop = scroller.scrollTop;
};

const handleDragging = (e) => {
  if (!isGrabbed) return;
  e.preventDefault();
  const yPos = e.pageY - scroller.offsetTop;
  const walk = (yPos - initialPos) * 2;
  scroller.scrollTop = scrollTop - walk;
};

const deInitializeDrag = () => {
  isGrabbed = false;
  scroller.classList.remove('active');
  imageBox.forEach((box) => {
    box.classList.remove('shadow');
  });
};

scroller.addEventListener('mousedown', initializeDrag);
scroller.addEventListener('mousemove', handleDragging);
scroller.addEventListener('mouseleave', deInitializeDrag);
scroller.addEventListener('mouseup', deInitializeDrag);

//////////////////////////////////////////////////
// THEME SWITCHERS

const body = document.body;
const colorPicker = document.querySelectorAll('.theme-switcher__color-picker');
const lightDarkBtn = document.querySelectorAll('.light-dark-btn');
const lightDarkIcon = document.querySelectorAll('.light-dark-icon');
const primaryThemeBtn = document.querySelectorAll('.primary-theme');
const secondaryThemeBtn = document.querySelectorAll('.secondary-theme');

const preferenceQuery = window.matchMedia('(prefers-color-scheme: light)');

const setDarkTheme = () => {
  lightDarkIcon.forEach((ldIcon) => {
    ldIcon.classList.replace('fa-moon', 'fa-sun');
  });

  colorPicker.forEach((picker) => {
    picker.classList.add('d-none');
  });

  body.classList.remove('light-mode', 'gray-mode');
  body.classList.add('dark-mode');
};

const setLightTheme = () => {
  body.classList.contains('light-mode')
    ? setSecondaryTheme()
    : setPrimaryTheme();

  colorPicker.forEach((picker) => {
    picker.classList.remove('d-none');
  });
};

const setPrimaryTheme = () => {
  lightDarkIcon.forEach((ldIcon) => {
    ldIcon.classList.replace('fa-sun', 'fa-moon');
  });

  body.classList.remove('dark-mode', 'gray-mode');
  body.classList.add('light-mode');

  primaryThemeBtn.forEach((btn) => {
    btn.classList.add('theme-active');
  });

  secondaryThemeBtn.forEach((btn) => {
    btn.classList.remove('theme-active');
  });
};

const setSecondaryTheme = () => {
  lightDarkIcon.forEach((ldIcon) => {
    ldIcon.classList.replace('fa-sun', 'fa-moon');
  });

  body.classList.remove('dark-mode', 'light-mode');
  body.classList.add('gray-mode');

  secondaryThemeBtn.forEach((btn) => {
    btn.classList.add('theme-active');
  });

  primaryThemeBtn.forEach((btn) => {
    btn.classList.remove('theme-active');
  });
};

const toggleTheme = () => {
  !body.classList.contains('dark-mode') ? setDarkTheme() : setLightTheme();
};

const checkPreference = () => {
  preferenceQuery.matches && window.matchMedia
    ? setDarkTheme()
    : setLightTheme();
};

lightDarkBtn.forEach((ldBtn) => {
  ldBtn.addEventListener('click', toggleTheme);
});

primaryThemeBtn.forEach((primaryBtn) => {
  primaryBtn.addEventListener('click', setPrimaryTheme);
});

secondaryThemeBtn.forEach((secondaryBtn) => {
  secondaryBtn.addEventListener('click', setSecondaryTheme);
});

preferenceQuery.addEventListener('change', checkPreference);
window.addEventListener('DOMContentLoaded', checkPreference);
