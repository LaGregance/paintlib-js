import { BaseAction, UIActionType } from './base-action';
import { PaintLib } from '../../paintlib';

export abstract class BaseSelectableAction extends BaseAction {
  constructor(paintlib: PaintLib, type: UIActionType) {
    super(paintlib, type, 'selectable');
  }

  onClick() {}
}
