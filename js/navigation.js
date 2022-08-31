import { Menubar } from './Menubar/Menubar.js';

const navigationOpenner = document.querySelector('.button--category');
const navigation = document.querySelector('.navigation__list');

const menubar = new Menubar(navigation, {
  openner: navigationOpenner,
});

menubar.init();

console.log(menubar);
