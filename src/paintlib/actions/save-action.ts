import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { UIActionType } from '../config/ui-action-type';

function downloadImageFromDataURL(dataURL: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export class SaveAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.SAVE);
  }

  onClick() {
    // TODO: Trigger event on paintlib
    // const dataURL = this.paintlib.getDataURL();
    const result = this.paintlib.serialize();
    const data = btoa(JSON.stringify(result));
    downloadImageFromDataURL(this.paintlib.getDataURL(), 'image.' + this.paintlib.getOptions().format);
    console.log('TODO: Save: ', data);
  }
}
