import { BaseAction } from './base-action';
import { PaintLib } from '../../paintlib';
import { PaintActionType } from '../../config/paint-action-type';

export abstract class BaseSelectableAction extends BaseAction {
  constructor(paintlib: PaintLib, type: PaintActionType) {
    super(paintlib, type, 'selectable');
  }

  onClick() {}
}
