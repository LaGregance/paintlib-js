import { Component } from './component';

export class ActionGroup extends Component<'div'> {
  constructor(private buttons: Component<any>[]) {
    super('div');
  }

  init() {
    this.element.className = 'paintlib-menu-group';

    for (const btn of this.buttons) {
      this.add(btn);
    }
  }
}
