import { MenubarItem } from './MenubarItem.js';

/* -------------------------------------------------------------------------- */
/* Menubar                                                                    */
/* -------------------------------------------------------------------------- */

export class Menubar {
  static defaultOptions = {
    openner: null,
    activeClass: 'is--active',
  };

  constructor(domNode, options = {}) {
    let msgPrefix = 'Menubar 클래스 menubarNode 전달인자';

    if (!(domNode instanceof Element)) {
      throw new TypeError(msgPrefix + '는 DOM 요소가 아닙니다.');
    }

    if (domNode.childElementCount === 0) {
      throw new Error(msgPrefix + '는 요소 자식을 포함하지 않습니다.');
    }

    let e = domNode.firstElementChild;

    while (e) {
      let menubarItem = e.firstElementChild;
      if (e && menubarItem && menubarItem.tagName !== 'A') {
        throw new Error(msgPrefix + '의 자식 요소가 A 요소가 아닙니다.');
      }
      e = e.nextElementSibling;
    }

    this.isMenubar = true;

    this.domNode = domNode;

    this.menubarItems = [];
    this.firstChars = [];

    this.firstItem = null;
    this.lastItem = null;

    this.hasFocus = false;
    this.hasHover = false;

    this.options = { ...Menubar.defaultOptions, ...options };
  }

  init() {
    this.settingOpenner();

    let menubarItem, textContent, numItems;

    let elem = this.domNode.firstElementChild;

    while (elem) {
      let menuElement = elem.firstElementChild;

      if (elem && menuElement && menuElement.tagName === 'A') {
        menubarItem = new MenubarItem(menuElement, this);
        menubarItem.init();
        this.menubarItems.push(menubarItem);
        textContent = menuElement.textContent.trim();
        this.firstChars.push(textContent.substring(0, 1).toLowerCase());
      }

      elem = elem.nextElementSibling;
    }

    numItems = this.menubarItems.length;
    if (numItems > 0) {
      this.firstItem = this.menubarItems[0];
      this.lastItem = this.menubarItems[numItems - 1];
    }
    this.firstItem.domNode.tabIndex = 0;
  }

  active() {
    this.navigation.classList.add(this.options.activeClass);
    this.options.openner.classList.add(this.options.activeClass);
  }

  open() {
    this.navigation.classList.add(this.options.activeClass);
    this.options.openner.classList.add(this.options.activeClass);
  }

  close() {
    this.navigation.classList.remove(this.options.activeClass);
    this.options.openner.classList.remove(this.options.activeClass);
  }

  settingOpenner() {
    const {
      domNode,
      options: { openner },
    } = this;

    this.navigation = domNode.parentNode.parentNode;

    if (!openner)
      throw new Error(
        `Menubar 컴포넌트를 열 수 있는 오프너 버튼 등록이 필요합니다.`
      );

    let categoryHasHover = false;

    openner.addEventListener('mouseenter', () => {
      categoryHasHover = true;
      this.open();
    });

    openner.addEventListener('keydown', (event) => {
      if (event.keyCode == 13) {
        // Enter
        categoryHasHover = true;
        this.open();
      } else if (event.keyCode == 27) {
        // Esc
        categoryHasHover = false;
        this.close();
      }
    });

    openner.addEventListener('mouseleave', () => {
      categoryHasHover = false;
      setTimeout(() => {
        if (!categoryHasHover) {
          this.close();
        }
      }, 100);
      this.active(openner, false);
    });

    let navigationInner = domNode.parentNode;

    navigationInner.addEventListener('mouseenter', () => {
      categoryHasHover = true;
    });

    navigationInner.addEventListener('mouseleave', () => {
      this.close();
      categoryHasHover = false;
    });
  }

  setFocusToItem(newItem) {
    let flag = false;

    for (let i = 0; i < this.menubarItems.length; i++) {
      let mbi = this.menubarItems[i];

      if (mbi.domNode.tabIndex == 0) {
        flag = mbi.domNode.getAttribute('aria-expanded') === 'true';
      }

      mbi.domNode.tabIndex = -1;
      if (mbi.popupMenu) {
        mbi.popupMenu.close();
      }
    }

    newItem.domNode.focus();
    newItem.domNode.tabIndex = 0;

    if (flag && newItem.popupMenu) {
      newItem.popupMenu.open();
    }
  }

  setFocusToFirstItem() {
    this.setFocusToItem(this.firstItem);
  }

  setFocusToLastItem() {
    this.setFocusToItem(this.lastItem);
  }

  setFocusToPreviousItem(currentItem) {
    let index;
    let newItem;

    if (currentItem === this.firstItem) {
      newItem = this.lastItem;
    } else {
      index = this.menubarItems.indexOf(currentItem);
      newItem = this.menubarItems[index - 1];
    }

    this.setFocusToItem(newItem);
  }

  setFocusToNextItem(currentItem) {
    let index;
    let newItem;

    if (currentItem === this.lastItem) {
      newItem = this.firstItem;
    } else {
      index = this.menubarItems.indexOf(currentItem);
      newItem = this.menubarItems[index + 1];
    }

    this.setFocusToItem(newItem);
  }

  setFocusByFirstCharacter(currentItem, character) {
    let start;
    let index;
    let char = character.toLowerCase();

    start = this.menubarItems.indexOf(currentItem) + 1;
    if (start === this.menubarItems.length) {
      start = 0;
    }

    index = this.getIndexFirstChars(start, char);

    if (index === -1) {
      index = this.getIndexFirstChars(0, char);
    }

    if (index > -1) {
      this.setFocusToItem(this.menubarItems[index]);
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
}
