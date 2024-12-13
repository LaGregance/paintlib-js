import { BaseAction } from '../../actions/abstract/base-action';
import { Component } from '../component';
import { useState } from '../../utils/use-state';
import { PaintLib } from '../../paintlib';
import { PaintActionType } from '../../models/paint-action-type';

export class ActionButton extends Component<'button'> {
  private type: PaintActionType;

  constructor(
    private paintlib: PaintLib,
    private actionCreator: () => BaseAction,
    private image: string,
    private tooltipText?: string,
    private onClickFinish?: () => void,
  ) {
    super('button');
    this.type = actionCreator().type;
  }

  init() {
    this.element.className = 'paintlib-menu-button';

    this.element.onclick = () => {
      this.paintlib.uiStore.getState().setAction(this.actionCreator());
      this.onClickFinish?.();
    };

    if (this.paintlib.customization.enableTooltip && this.tooltipText) {
      const portal = this.paintlib['element'];
      let tooltip: HTMLDivElement;

      this.element.onmouseenter = (event: MouseEvent) => {
        const anchor = event.currentTarget as HTMLElement;
        const portalRect = portal.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();

        tooltip = document.createElement('div');
        tooltip.className = 'paintlib-tooltip';
        tooltip.innerText = this.tooltipText;
        portal.appendChild(tooltip);

        const tooltipRect = tooltip.getBoundingClientRect();
        const topAnchor = anchorRect.top + anchorRect.height + 3 - portalRect.top;
        let leftAnchor = Math.max(anchorRect.left - tooltipRect.width / 2 + anchorRect.width / 2 - portalRect.left, 1);
        if (leftAnchor + tooltipRect.width > portalRect.width) {
          leftAnchor = portalRect.width - tooltipRect.width - 1;
        }

        tooltip.style.top = topAnchor + 'px';
        tooltip.style.left = leftAnchor + 'px';
      };

      this.element.onmouseleave = () => {
        tooltip?.remove();
        tooltip = undefined;
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

  setDisable(disable: boolean) {
    if (disable) {
      this.element.classList.add('disable');
    } else {
      this.element.classList.remove('disable');
    }
  }
}
