import { BaseAction, UIActionType } from './base-action';
import { Canvas, FabricImage } from 'fabric';

export class SelectAction extends BaseAction {
  constructor(canvas: Canvas) {
    super(canvas, UIActionType.SELECT);
  }

  onSelected() {
    console.log('Circle select');
    this.canvas.forEachObject((object) => {
      if (!(object instanceof FabricImage)) {
        object.selectable = true;
        object.lockMovementY = false;
        object.lockMovementX = false;
      }
    });
  }

  onDeselected() {
    console.log('Circle deselect');
    this.canvas.forEachObject((object) => {
      if (!(object instanceof FabricImage)) {
        object.selectable = false;
        object.lockMovementY = true;
        object.lockMovementX = true;
      }
    });
  }

  onMouseDown() {}
  onMouseMove() {}
  onMouseUp() {}
}
