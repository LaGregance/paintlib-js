import { ActionButton } from './action-button';
import { Component } from './component';

export class ActionGroup extends Component<'div'> {
  constructor(private buttons: ActionButton[]) {
    super('div');
  }

  init() {
    this.element.className = 'paintlib-menu-group';

    for (const btn of this.buttons) {
      this.add(btn);
    }
  }
}
