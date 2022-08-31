import { MenuItem } from './MenuItem.js';

/* -------------------------------------------------------------------------- */
/* PopupMenu                                                                  */
/* -------------------------------------------------------------------------- */

export class PopupMenu {
  constructor(domNode, controllerObj) {
    let msgPrefix = 'PopupMenu 클래스 domNode 전달인자';

    if (!(domNode instanceof Element)) {
      throw new TypeError(msgPrefix + '는 DOM 요소가 아닙니다.');
    }
    if (domNode.childElementCount === 0) {
      throw new Error(msgPrefix + '는 요소 자식을 포함하지 않습니다.');
    }
    let childElement = domNode.firstElementChild;
    while (childElement) {
      let menuitem = childElement.firstElementChild;
      if (menuitem && menuitem === 'A') {
        throw new Error(msgPrefix + '는 A 요소가 아닌 자손 요소를 포함합니다.');
      }
      childElement = childElement.nextElementSibling;
    }

    this.isMenubar = false;

    this.domNode = domNode;
    this.controller = controllerObj;
    this.activeClass = this.controller.activeClass;

    this.menuitems = [];
    this.firstChars = [];

    this.firstItem = null;
    this.lastItem = null;

    this.hasFocus = false;
    this.hasHover = false;
  }

  init() {
    let childElement, menuElement, menuItem, textContent, numItems;

    this.domNode.addEventListener('mouseover', this.handleMouseOver.bind(this));
    this.domNode.addEventListener('mouseout', this.handleMouseOut.bind(this));

    childElement = this.domNode.firstElementChild;

    while (childElement) {
      menuElement = childElement.firstElementChild;

      if (menuElement && menuElement.tagName === 'A') {
        menuItem = new MenuItem(menuElement, this);
        menuItem.init();
        this.menuitems.push(menuItem);
        textContent = menuElement.textContent.trim();
        this.firstChars.push(textContent.substring(0, 1).toLowerCase());
      }
      childElement = childElement.nextElementSibling;
    }

    numItems = this.menuitems.length;

    if (numItems > 0) {
      this.firstItem = this.menuitems[0];
      this.lastItem = this.menuitems[numItems - 1];
    }

    if (this.controller.domNode) {
      this.domNode.id = this.controller.domNode.getAttribute('aria-controls');
    }
  }

  handleMouseOver() {
    this.hasHover = true;
  }

  handleMouseOut() {
    this.hasHover = false;
    setTimeout(this.close.bind(this, false), 1);
  }

  setFocusToController(command, flag) {
    if (typeof command !== 'string') {
      command = '';
    }

    function setFocusToMenubarItem(controller, close) {
      while (controller) {
        if (controller.isMenubarItem) {
          controller.domNode.focus();
          return controller;
        } else {
          if (close) {
            setTimeout(controller.menu.close.bind(controller.menu, false), 100);
          }
          controller.hasFocus = false;
        }
        controller = controller.menu.controller;
      }
      return false;
    }

    if (command === '') {
      if (this.controller && this.controller.domNode) {
        this.controller.domNode.focus();
      }
      return;
    }

    this.controller.domNode.focus();
    this.close();

    if (command === 'next') {
      let menubarItem = setFocusToMenubarItem(this.controller, false);
      if (menubarItem) {
        menubarItem.menu.setFocusToNextItem(menubarItem, flag);
      }
    }
  }

  setFocusToFirstItem() {
    this.firstItem.domNode.focus();
  }

  setFocusToLastItem() {
    this.lastItem.domNode.focus();
  }

  setFocusToPreviousItem(currentItem) {
    let index;

    if (currentItem === this.firstItem) {
      this.lastItem.domNode.focus();
    } else {
      index = this.menuitems.indexOf(currentItem);
      this.menuitems[index - 1].domNode.focus();
    }
  }

  setFocusToNextItem(currentItem) {
    let index;

    if (currentItem === this.lastItem) {
      this.firstItem.domNode.focus();
    } else {
      index = this.menuitems.indexOf(currentItem);
      this.menuitems[index + 1].domNode.focus();
    }
  }

  setFocusByFirstCharacter(currentItem, character) {
    let start,
      index,
      char = character.toLowerCase();

    start = this.menuitems.indexOf(currentItem) + 1;
    if (start === this.menuitems.length) {
      start = 0;
    }

    index = this.getIndexFirstChars(start, char);

    if (index === -1) {
      index = this.getIndexFirstChars(0, char);
    }

    if (index > -1) {
      this.menuitems[index].domNode.focus();
    }
  }

  getIndexFirstChars(startIndex, char) {
    for (let i = startIndex; i < this.firstChars.length; i++) {
      if (char === this.firstChars[i]) {
        return i;
      }
    }
    return -1;
  }

  open() {
    this.domNode.classList.add(this.activeClass);
    this.controller.setExpanded(true);
  }

  close(force) {
    let controllerHasHover = this.controller.hasHover;

    let hasFocus = this.hasFocus;

    for (let i = 0; i < this.menuitems.length; i++) {
      let mi = this.menuitems[i];
      if (mi.popupMenu) {
        hasFocus = hasFocus | mi.popupMenu.hasFocus;
      }
    }

    if (!this.controller.isMenubarItem) {
      controllerHasHover = false;
    }

    if (force || (!hasFocus && !this.hasHover && !controllerHasHover)) {
      this.domNode.classList.remove(this.activeClass);
      this.controller.setExpanded(false);
    }
  }
}
