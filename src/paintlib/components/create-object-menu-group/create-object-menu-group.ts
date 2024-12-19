import { Component } from '../component';
import { PaintLib } from '../../paintlib';
import { ActionButton } from '../buttons/action-button';
import { ShowMoreActionButton } from './show-more-action-button';
import { ActionGroup } from '../action-group';
import { useState } from '../../utils/use-state';
import { PaintActionType } from '../../models/paint-action-type';
import { ObjectRegistry } from '../../config/object-registry';
import { MenuSizing } from '../../config/menu-sizing';

/**
 * This component is responsible to manage the middle part of the menu (object part).
 * His role is to adapt the menu regarding of the width of the container and add "..." extension if relevant.
 */
export class CreateObjectMenuGroup extends Component<'div'> {
  private readonly MIN_WIDTH: number;

  private availableActions: PaintActionType[];
  private userActionSlots: { action: PaintActionType; addedAt: number }[];
  private moreBtn: ShowMoreActionButton;

  private mainButtonsMap = new Map<PaintActionType, ActionButton>();
  private menuButtonsMap = new Map<PaintActionType, ActionButton>();

  private availableBtnCount: number;
  private container: HTMLDivElement;

  constructor(private paintlib: PaintLib) {
    super('div');
    this.availableActions = ObjectRegistry.getAllObjectActions().filter((x) => this.paintlib.haveAction(x));

    this.MIN_WIDTH = MenuSizing.getSizing(paintlib).WIDTH_FULL_SIZE;

    this.calcAvailableBtnCount();
    this.userActionSlots = [];
  }

  private calcAvailableBtnCount() {
    if (!this.container || this.container.clientWidth > this.MIN_WIDTH) {
      this.availableBtnCount = this.availableActions.length;
    } else {
      const style = this.paintlib.customization.style;

      const availableWidth =
        this.container.clientWidth -
        (this.MIN_WIDTH - this.availableActions.length * (style.buttonSize + style.buttonGap));
      this.availableBtnCount = Math.max(Math.trunc(availableWidth / (style.buttonSize + style.buttonGap)), 2) - 1;
    }
  }

  private updateUserActionSlot(action: PaintActionType) {
    let updated = false;

    // 1. Trunc the slots to fit availableBtnCount
    if (this.userActionSlots.length > this.availableBtnCount) {
      this.userActionSlots = this.userActionSlots.slice(0, this.availableBtnCount);
      updated = true;
    }

    // 2. If the action is not present, add it or replace the first action
    if (action && !this.userActionSlots.find((x) => x.action === action)) {
      if (this.userActionSlots.length < this.availableBtnCount) {
        // Remaining slot: add it
        this.userActionSlots.push({ action, addedAt: Date.now() });
      } else {
        // Else: replace le oldest slot
        let oldestIndex = 0;
        for (let i = 1; i < this.userActionSlots.length; i++) {
          if (this.userActionSlots[i].addedAt < this.userActionSlots[oldestIndex].addedAt) {
            oldestIndex = i;
          }
        }

        this.userActionSlots[oldestIndex] = { action, addedAt: Date.now() };
      }
      return true;
    }
    return updated;
  }

  private createObjectBtn(type: PaintActionType, targetMore = false) {
    const meta = ObjectRegistry.getObjectMeta(type);
    const onClick = targetMore ? () => this.moreBtn?.hideMenu() : undefined;
    return new ActionButton(
      this.paintlib,
      () => ObjectRegistry.createAction(type, this.paintlib),
      meta.icon,
      this.paintlib.customization.labels.tooltip[type],
      undefined,
      onClick,
    );
  }

  init() {
    this.element.className = 'paintlib-menu-group';

    for (const action of this.availableActions) {
      const mainBtn = this.createObjectBtn(action);
      const menuBtn = this.createObjectBtn(action, true);
      this.add(mainBtn);

      this.mainButtonsMap.set(action, mainBtn);
      this.menuButtonsMap.set(action, menuBtn);
    }

    this.moreBtn = new ShowMoreActionButton(this.paintlib, (menu) => {
      menu.add(new ActionGroup(this.availableActions.map((action) => this.menuButtonsMap.get(action))));
    });
    this.moreBtn.element.style.order = (this.availableActions.length + 2).toString();
    this.add(this.moreBtn);

    this.container = document.querySelector('.paintlib-root');
    this.update();

    new ResizeObserver(() => {
      const previousCount = this.availableBtnCount;
      this.calcAvailableBtnCount();

      if (previousCount !== this.availableBtnCount) {
        this.updateUserActionSlot(null);
        this.update();
      }
    }).observe(this.container);

    useState(
      this.paintlib.uiStore,
      (store) => store.activeAction,
      (action) => {
        if (this.availableActions.includes(action) && this.updateUserActionSlot(action)) {
          this.update();
        }
      },
    );
  }

  private update() {
    if (this.availableBtnCount >= this.availableActions.length) {
      // Full mode
      for (const action of this.availableActions) {
        const btn = this.mainButtonsMap.get(action);
        btn.setVisible(true);
        btn.element.style.removeProperty('order');
      }
      this.moreBtn.setVisible(false);
    } else {
      // Reduced mode
      let remainingSlot = this.availableBtnCount;
      for (const action of this.availableActions) {
        const mainBtn = this.mainButtonsMap.get(action);
        const menuBtn = this.menuButtonsMap.get(action);

        const slotIndex = this.userActionSlots.findIndex((x) => x.action === action);

        if (slotIndex < 0) {
          mainBtn.setVisible(false);
          menuBtn.setVisible(true);
          mainBtn.element.style.order = (this.availableActions.length + 1).toString();
        } else {
          mainBtn.setVisible(true);
          menuBtn.setVisible(false);
          mainBtn.element.style.order = slotIndex.toString();
          remainingSlot--;
        }
      }

      if (remainingSlot > 0) {
        for (const action of this.availableActions) {
          const mainBtn = this.mainButtonsMap.get(action);
          const menuBtn = this.menuButtonsMap.get(action);

          const slotIndex = this.userActionSlots.findIndex((x) => x.action === action);

          if (slotIndex < 0) {
            mainBtn.setVisible(true);
            menuBtn.setVisible(false);
            mainBtn.element.style.order = (this.availableActions.length + 1).toString();
            remainingSlot--;

            if (remainingSlot <= 0) {
              break;
            }
          }
        }
      }

      this.moreBtn.setVisible(true);
    }
  }
}
