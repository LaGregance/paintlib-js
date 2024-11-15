import { BaseAction, UIActionType } from '../actions/base-action';
import { Component } from './component';
import { useState } from '../utils/use-state';
import { PaintLib } from '../paintlib';

export class ActionButton extends Component<'button'> {
  private type: UIActionType;

  constructor(
    private paintlib: PaintLib,
    private actionCreator: () => BaseAction,
    private image: string,
  ) {
    super('button');
    this.type = actionCreator().type;
  }

  init() {
    this.element.className = 'paintlib-menu-button selected';
    this.element.onclick = () => {
      this.paintlib.uiStore.getState().setAction(this.actionCreator());
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
}
