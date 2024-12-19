import { BaseAction } from '../../actions/abstract/base-action';
import { Component } from '../component';
import { useState } from '../../utils/use-state';
import { PaintLib } from '../../paintlib';
import { PaintActionType } from '../../models/paint-action-type';

export class ActionButton extends Component<'button'> {
  private type: PaintActionType;
  private doubleConfirmEntered = false;

  /**
   *
   * @param paintlib
   * @param actionCreator
   * @param image
   * @param tooltipText
   * @param doubleConfirm When defined, the action show a tooltip to ask the user to click a second time to confirm
   * @param onClickFinish
   */
  constructor(
    private paintlib: PaintLib,
    private actionCreator: () => BaseAction,
    private image: string,
    private tooltipText?: string,
    private doubleConfirm?: string,
    private onClickFinish?: () => void,
  ) {
    super('button');
    this.type = actionCreator().type;
  }

  init() {
    this.element.className = 'paintlib-menu-button';

    let tooltipHover: HTMLDivElement;
    let tooltipConfirm: HTMLDivElement;

    const hideConfirm = () => {
      tooltipConfirm?.remove();
      tooltipConfirm = undefined;
      this.doubleConfirmEntered = false;
      document.removeEventListener('click', hideConfirm);
    };

    this.element.onclick = () => {
      if (this.doubleConfirm && !this.doubleConfirmEntered) {
        this.doubleConfirmEntered = true;

        tooltipHover?.remove();
        tooltipHover = undefined;

        requestAnimationFrame(() => {
          // If we don't requestAnimationFrame, the hideConfirm is triggered directly
          tooltipConfirm = this.createTooltip(this.element, this.doubleConfirm);
          document.addEventListener('click', hideConfirm);
        });
      } else {
        hideConfirm();

        this.paintlib.uiStore.getState().setAction(this.actionCreator());
        this.onClickFinish?.();
      }
    };

    if (this.paintlib.customization.enableTooltip && this.tooltipText) {
      this.element.onmouseenter = (event: MouseEvent) => {
        if (this.doubleConfirmEntered) {
          return;
        }
        const anchor = event.currentTarget as HTMLElement;
        tooltipHover = this.createTooltip(anchor, this.tooltipText);
      };

      this.element.onmouseleave = () => {
        tooltipHover?.remove();
        tooltipHover = undefined;
      };
    }

    useState(
      this.paintlib.uiStore,
      (state) => state.activeAction,
      (action) => {
        if (action === this.type) {
          this.element.classList.add('selected');
        } else {
          this.element.classList.remove('selected');
        }
      },
    );

    this.element.innerHTML = this.image;
  }

  private createTooltip(anchor: HTMLElement, label: string) {
    const portal = this.paintlib['element'];

    const portalRect = portal.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();

    const tooltip = document.createElement('div');
    tooltip.className = 'paintlib-tooltip';
    tooltip.innerText = label;
    portal.appendChild(tooltip);

    const tooltipRect = tooltip.getBoundingClientRect();
    const topAnchor = anchorRect.top + anchorRect.height + 3 - portalRect.top;
    let leftAnchor = Math.max(anchorRect.left - tooltipRect.width / 2 + anchorRect.width / 2 - portalRect.left, 1);
    if (leftAnchor + tooltipRect.width > portalRect.width) {
      leftAnchor = portalRect.width - tooltipRect.width - 1;
    }

    tooltip.style.top = topAnchor + 'px';
    tooltip.style.left = leftAnchor + 'px';
    return tooltip;
  }

  setDisable(disable: boolean) {
    if (disable) {
      this.element.classList.add('disable');
    } else {
      this.element.classList.remove('disable');
    }
  }
}
