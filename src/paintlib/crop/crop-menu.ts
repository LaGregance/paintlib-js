import CancelSVG from '../svgs/cancel.svg';
import SaveSVG from '../svgs/save.svg';
import { Component } from '../components/component';
import { View } from '../components/view';
import { ActionGroup } from '../components/action-group';
import { IconButton } from '../components/buttons/icon-button';

export class CropMenu extends Component<'div'> {
  constructor(
    private onSave: () => any,
    private onCancel: () => any,
  ) {
    super('div');
  }

  init() {
    this.element.className = 'paintlib-menu';
    this.element.style.zIndex = '2000';

    const actionsView = new View('paintlib-menu-line');
    actionsView.element.style.justifyContent = 'center';

    const cancel = new IconButton(this.onCancel, CancelSVG);
    const save = new IconButton(this.onSave, SaveSVG);

    actionsView.add(new ActionGroup([cancel, save]));
    this.add(actionsView);
  }
}
