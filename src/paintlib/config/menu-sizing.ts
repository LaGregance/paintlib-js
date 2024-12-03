import { PaintActionType } from '../models/paint-action-type';
import { PaintLib } from '../paintlib';
import { ObjectRegistry } from './object-registry';

export abstract class MenuSizing {
  public static getSizing(paintlib: PaintLib) {
    const style = paintlib.customization.style;
    const availableActions = ObjectRegistry.getAllObjectActions().filter((x) => paintlib.haveAction(x));

    const selectGroupCount = MenuSizing.countAvailableActionsInArray(paintlib, [
      PaintActionType.SELECT,
      PaintActionType.TRASH,
      PaintActionType.UNDO,
      PaintActionType.REDO,
    ]);

    const objectGroupCount = MenuSizing.countAvailableActionsInArray(paintlib, availableActions);
    const rotateGroupCount = MenuSizing.countAvailableActionsInArray(paintlib, [
      PaintActionType.ROTATE_LEFT,
      PaintActionType.ROTATE_RIGHT,
      PaintActionType.CROP,
    ]);
    const saveGroupCount = MenuSizing.countAvailableActionsInArray(paintlib, [
      PaintActionType.CANCEL,
      PaintActionType.SAVE,
    ]);

    const countButtons = selectGroupCount + objectGroupCount + rotateGroupCount + saveGroupCount;
    const countGroup =
      (selectGroupCount ? 1 : 0) + (objectGroupCount ? 1 : 0) + (rotateGroupCount ? 1 : 0) + (saveGroupCount ? 1 : 0);

    const WIDTH_FULL_SIZE =
      style.groupGap * (countGroup - 1) +
      (style.buttonSize + style.buttonGap) * countButtons -
      style.buttonGap * countGroup;

    const WIDTH_MIN_SIZE =
      style.groupGap * (countGroup - 1) +
      (style.buttonSize + style.buttonGap) * (countButtons - (objectGroupCount ? objectGroupCount + 2 : 0)) -
      style.buttonGap * countGroup;

    return { WIDTH_FULL_SIZE, WIDTH_MIN_SIZE };
  }

  private static countAvailableActionsInArray(paintlib: PaintLib, actions: PaintActionType[]) {
    let available = 0;
    for (const action of actions) {
      if (paintlib.haveAction(action)) {
        available += 1;
      }
    }
    return available;
  }
}
