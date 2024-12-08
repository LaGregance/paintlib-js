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
