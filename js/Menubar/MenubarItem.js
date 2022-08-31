import { KEYCODE, uuidv4, isPrintableCharacter } from '../utils/utils.js';
import { PopupMenu } from './PopupMenu.js';

/* -------------------------------------------------------------------------- */
/* MenubarItem                                                                */
/* -------------------------------------------------------------------------- */

export class MenubarItem {
  constructor(domNode, menuObj) {
    this.menu = menuObj;
    this.activeClass = this.menu.options.activeClass;

    this.domNode = domNode;

    this.popupMenu = false;

    this.hasFocus = false;
    this.hasHover = false;

    this.isMenubarItem = true;

    this.keyCode = KEYCODE;
  }

  init() {
    this.domNode.tabIndex = -1;

    this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
    this.domNode.addEventListener('focus', this.handleFocus.bind(this));
    this.domNode.addEventListener('blur', this.handleBlur.bind(this));
    this.domNode.addEventListener('mouseover', this.handleMouseOver.bind(this));
    this.domNode.addEventListener('mouseout', this.handleMouseOut.bind(this));

    let nextElement = this.domNode.nextElementSibling;

    if (nextElement && nextElement.tagName === 'UL') {
      this.domNode.setAttribute('aria-controls', uuidv4());
      this.setExpanded(false);
      this.popupMenu = new PopupMenu(nextElement, this);
      this.popupMenu.init();
    }
  }

  handleKeydown(event) {
    let char = event.key;
    let flag = false;

    switch (event.keyCode) {
      case this.keyCode.SPACE:
      case this.keyCode.RETURN:
      case this.keyCode.RIGHT:
        if (this.popupMenu) {
          this.popupMenu.open();
          this.popupMenu.setFocusToFirstItem();
          flag = true;
        }
        break;

      case this.keyCode.UP:
        this.menu.setFocusToPreviousItem(this);
        flag = true;
        break;

      case this.keyCode.DOWN:
        this.menu.setFocusToNextItem(this);
        flag = true;
        break;

      case this.keyCode.HOME:
      case this.keyCode.PAGEUP:
        this.menu.setFocusToFirstItem();
        flag = true;
        break;

      case this.keyCode.END:
      case this.keyCode.PAGEDOWN:
        this.menu.setFocusToLastItem();
        flag = true;
        break;

      case this.keyCode.TAB:
        this.popupMenu.close(true);
        break;

      case this.keyCode.ESC:
        this.menu.close();
        this.menu.options.openner.focus();
        break;

      default:
        if (isPrintableCharacter(char)) {
          this.menu.setFocusByFirstCharacter(this, char);
          flag = true;
        }
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  setExpanded(value) {
    if (value) {
      this.domNode.setAttribute('aria-expanded', 'true');
      this.domNode.classList.add(this.activeClass);
    } else {
      this.domNode.setAttribute('aria-expanded', 'false');
      this.domNode.classList.remove(this.activeClass);
    }
  }

  handleFocus() {
    this.menu.hasFocus = true;
  }

  handleBlur() {
    this.menu.hasFocus = false;
  }

  handleMouseOver() {
    this.hasHover = true;
    if (this.popupMenu.open) {
      setTimeout(this.popupMenu.open.bind(this.popupMenu, false), 100);
    }
  }

  handleMouseOut() {
    this.hasHover = false;
    if (this.popupMenu.close) {
      setTimeout(this.popupMenu.close.bind(this.popupMenu, false), 100);
    }
  }
}
