import { BaseAction } from './base-action';
import { PaintLib } from '../../paintlib';
import { UIActionType } from '../../config/ui-action-type';

export abstract class BaseSelectableAction extends BaseAction {
  constructor(paintlib: PaintLib, type: UIActionType) {
    super(paintlib, type, 'selectable');
  }

  onClick() {}
}
