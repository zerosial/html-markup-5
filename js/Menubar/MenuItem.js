import { KEYCODE, uuidv4, isPrintableCharacter } from '../utils/utils.js';
import { PopupMenu } from './PopupMenu.js';

/* -------------------------------------------------------------------------- */
/* MenuItem                                                                   */
/* -------------------------------------------------------------------------- */

export class MenuItem {
  constructor(domNode, menuObj) {
    this.domNode = domNode;
    this.menu = menuObj;
    this.activeClass = this.menu.activeClass;
    this.popupMenu = false;
    this.isMenubarItem = false;
    this.keyCode = KEYCODE;
  }

  init() {
    this.domNode.tabIndex = -1;

    this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
    this.domNode.addEventListener('click', this.handleClick.bind(this));
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

  isExpanded() {
    return this.domNode.getAttribute('aria-expanded') === 'true';
  }

  handleKeydown(event) {
    let tgt = event.currentTarget,
      char = event.key,
      flag = false,
      clickEvent;

    switch (event.keyCode) {
      case this.keyCode.SPACE:
      case this.keyCode.RETURN:
        if (this.popupMenu) {
          this.popupMenu.open();
          this.popupMenu.setFocusToFirstItem();
        } else {
          try {
            clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true,
            });
          } catch (err) {
            if (document.createEvent) {
              clickEvent = document.createEvent('MouseEvents');
              clickEvent.initEvent('click', true, true);
            }
          }
          tgt.dispatchEvent(clickEvent);
        }

        flag = true;
        break;

      case this.keyCode.UP:
        this.menu.setFocusToPreviousItem(this);
        flag = true;
        break;

      case this.keyCode.DOWN:
        this.menu.setFocusToNextItem(this);
        flag = true;
        break;

      case this.keyCode.LEFT:
        this.menu.setFocusToController('previous', true);
        this.menu.close(true);
        flag = true;
        break;

      case this.keyCode.RIGHT:
        if (this.popupMenu) {
          this.popupMenu.open();
          this.popupMenu.setFocusToFirstItem();
        } else {
          this.menu.setFocusToController('next', true);
          this.menu.close(true);
        }
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

      case this.keyCode.ESC:
        this.menu.setFocusToController();
        this.menu.close(true);
        flag = true;
        break;

      case this.keyCode.TAB:
        this.menu.setFocusToController();
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

  handleClick() {
    this.menu.setFocusToController();
    this.menu.close(true);
  }

  handleFocus() {
    this.menu.hasFocus = true;
  }

  handleBlur() {
    this.menu.hasFocus = false;
    setTimeout(this.menu.close.bind(this.menu, false), 0);
  }

  handleMouseOver() {
    this.menu.hasHover = true;
    this.menu.open();
    if (this.popupMenu) {
      this.popupMenu.hasHover = true;
      setTimeout(this.popupMenu.open.bind(this.popupMenu, false), 100);
    }
  }

  handleMouseOut() {
    if (this.popupMenu) {
      this.popupMenu.hasHover = false;
      setTimeout(this.popupMenu.close.bind(this.popupMenu, false), 100);
    }

    this.menu.hasHover = false;
    setTimeout(this.menu.close.bind(this.menu, false), 100);
  }
}
