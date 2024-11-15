import { StoreApi } from 'zustand/vanilla';
import { UIStore } from '../store/ui-store';
import { BaseAction, UIActionType } from '../actions/base-action';
import { Component } from './component';
import { useState } from '../utils/use-state';

export class ActionButton extends Component<'button'> {
  private type: UIActionType;

  constructor(
    private uiStore: StoreApi<UIStore>,
    private actionCreator: () => BaseAction,
    private image: string,
  ) {
    super('button');
    this.type = actionCreator().type;
  }

  init() {
    this.element.className = 'paintlib-menu-button selected';
    this.element.onclick = () => {
      this.uiStore.getState().setAction(this.actionCreator());
    };

    useState(
      this.uiStore,
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
