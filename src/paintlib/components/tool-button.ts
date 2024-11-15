import { StoreApi } from 'zustand/vanilla';
import { UIStore } from '../store/ui-store';
import { UIActionType } from '../models/ui-action';
import { Component } from './component';
import { useState } from '../utils/use-state';

export class ToolButton extends Component<'button'> {
  constructor(
    private uiStore: StoreApi<UIStore>,
    private type: UIActionType,
    private image: string,
  ) {
    super('button');
  }

  init() {
    this.element.className = 'paintlib-menu-button selected';
    this.element.onclick = () => {
      this.uiStore.setState({ activeAction: this.type });
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
