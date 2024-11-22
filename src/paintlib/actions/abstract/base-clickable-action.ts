import { PaintLib } from '../../paintlib';
import { BaseAction } from './base-action';
import { UIActionType } from '../../config/ui-action-type';

export abstract class BaseClickableAction extends BaseAction {
  constructor(
    public readonly paintlib: PaintLib,
    public readonly type: UIActionType,
  ) {
    super(paintlib, type, 'clickable');
  }

  onSelected() {}
  onDeselected() {}
  onMouseDown() {}
  onMouseMove() {}
  onMouseUp() {}
}
