import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { UIActionType } from '../config/ui-action-type';
import { Rect } from 'fabric';

export class UndoRedoAction extends BaseClickableAction {
  constructor(
    paintlib: PaintLib,
    private mode: 'undo' | 'redo',
  ) {
    super(paintlib, mode === 'undo' ? UIActionType.UNDO : UIActionType.REDO);
  }

  onClick() {
    // TODO: Trigger event on paintlib
    console.log('TODO: ' + this.mode);

    const obj = this.paintlib.getSelectedObject();
    const layout = obj.getLayout();
    const rect = new Rect({
      left: layout.left,
      top: layout.top,
      width: layout.width,
      height: layout.height,
      scaleX: obj['fabricObject'].scaleX,
      scaleY: obj['fabricObject'].scaleY,
      fill: 'silver',
    });
    this.paintlib.canvas.add(rect);
    this.paintlib.canvas.bringObjectForward(rect);
    /*if (obj instanceof PaintLine) {
      const line = obj as PaintLine;
      console.log('angle', obj['fabricObject'].getTotalAngle());
      console.log('layout', obj.getLayout());
      console.log('layout', {
        x1: line['fabricObject'].x1,
        x2: line['fabricObject'].x2,
        y1: line['fabricObject'].y1,
        y2: line['fabricObject'].y2,
      });
      obj['fabricObject'].set({ angle: 0 });
      // obj.updateLayout(obj.getLayout(), obj['vector']);
      obj['fabricObject'].set({
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 50,
      });
      obj['fabricObject'].set({ angle: 90 });
      console.log('angle', obj['fabricObject'].getTotalAngle());
      console.log('layout', obj.getLayout());
      console.log('layout', {
        x1: line['fabricObject'].x1,
        x2: line['fabricObject'].x2,
        y1: line['fabricObject'].y1,
        y2: line['fabricObject'].y2,
      });
      // obj['fabricObject'].setCoords();
      this.paintlib.canvas.renderAll();
    } else {
      console.log('layout', obj.getLayout());
      obj.updateLayout(obj.getLayout(), obj['vector']);
      console.log('layout', obj.getLayout());
    }*/
  }
}
