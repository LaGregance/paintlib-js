import { Component } from './component';

export class View extends Component<'div'> {
  constructor(private classNames: string) {
    super('div');
  }

  init() {
    this.element.className = this.classNames;
  }
}
