import CursorSVG from '../svgs/cursor.svg';
import TrashSVG from '../svgs/trash.svg';
import UndoSVG from '../svgs/undo.svg';
import RedoSVG from '../svgs/redo.svg';
import RotateLeftSVG from '../svgs/rotate-left.svg';
import RotateRightSVG from '../svgs/rotate-right.svg';
import CropSVG from '../svgs/crop.svg';
import CancelSVG from '../svgs/cancel.svg';
import SaveSVG from '../svgs/save.svg';
import TextColorSVG from '../svgs/text-color.svg';
import ForegroundColorSVG from '../svgs/foreground-color.svg';
import BackgroundColorSVG from '../svgs/background-color.svg';
import ThicknessSVG from '../svgs/thickness.svg';
import { ActionButton } from './buttons/action-button';
import { Component } from './component';
import { SelectAction } from '../actions/select-action';
import { PaintLib } from '../paintlib';
import { TrashAction } from '../actions/trash-action';
import { ActionGroup } from './action-group';
import { View } from './view';
import { ColorPickerButton } from './buttons/color-picker-button';
import { TicknessPickerButton } from './buttons/tickness-picker-button';
import { CancelAction } from '../actions/cancel-action';
import { SaveAction } from '../actions/save-action';
import { UndoRedoAction } from '../actions/undo-redo-action';
import { MenuButton } from './buttons/menu-button';
import { useState } from '../utils/use-state';
import { CreateObjectMenuGroup } from './create-object-menu-group/create-object-menu-group';
import { RotateAction } from '../actions/rotate-action';
import { xor } from '../utils/utils';
import { PaintActionType } from '../config/paint-action-type';
import { DrawingOption } from '../config/drawing-option';
import { ObjectRegistry, PaintObjectClass } from '../config/object-registry';
import { PaintText } from '../objects/paint-text';
import { CropAction } from '../actions/crop-action';

export class MainMenu extends Component<'div'> {
  private optionsMenu: View;

  private options: {
    [key in DrawingOption]: MenuButton;
  };

  constructor(private paintlib: PaintLib) {
    super('div');
  }

  init() {
    this.element.className = 'paintlib-menu';

    const actionsView = new View('paintlib-menu-line');

    let trash: ActionButton = undefined;
    let undo: ActionButton = undefined;
    let redo: ActionButton = undefined;

    /* ************************************ */
    /* *********** SELECT GROUP *********** */
    /* ************************************ */
    const selectGroup = new View('paintlib-menu-group');
    if (this.paintlib.haveAction(PaintActionType.SELECT)) {
      selectGroup.add(new ActionButton(this.paintlib, () => new SelectAction(this.paintlib), CursorSVG));
    }
    if (this.paintlib.haveAction(PaintActionType.TRASH)) {
      trash = new ActionButton(this.paintlib, () => new TrashAction(this.paintlib), TrashSVG);
      selectGroup.add(trash);
    }
    if (this.paintlib.haveAction(PaintActionType.UNDO)) {
      undo = new ActionButton(this.paintlib, () => new UndoRedoAction(this.paintlib, 'undo'), UndoSVG);
      selectGroup.add(undo);
    }
    if (this.paintlib.haveAction(PaintActionType.REDO)) {
      redo = new ActionButton(this.paintlib, () => new UndoRedoAction(this.paintlib, 'redo'), RedoSVG);
      selectGroup.add(redo);
    }
    if (selectGroup['children'].length > 0) {
      actionsView.add(selectGroup);
    }

    /* ************************************ */
    /* *********** OBJECT GROUP *********** */
    /* ************************************ */
    actionsView.add(new CreateObjectMenuGroup(this.paintlib));

    /* ************************************ */
    /* ********* ROTATE/CROP GROUP ******** */
    /* ************************************ */
    const rotateGroup = new View('paintlib-menu-group');
    if (this.paintlib.haveAction(PaintActionType.ROTATE_LEFT)) {
      rotateGroup.add(new ActionButton(this.paintlib, () => new RotateAction(this.paintlib, 'left'), RotateLeftSVG));
    }
    if (this.paintlib.haveAction(PaintActionType.ROTATE_RIGHT)) {
      rotateGroup.add(new ActionButton(this.paintlib, () => new RotateAction(this.paintlib, 'right'), RotateRightSVG));
    }
    if (this.paintlib.haveAction(PaintActionType.CROP)) {
      rotateGroup.add(new ActionButton(this.paintlib, () => new CropAction(this.paintlib), CropSVG));
    }
    if (rotateGroup['children'].length > 0) {
      actionsView.add(rotateGroup);
    }

    /* ************************************ */
    /* ************ SAVE GROUP ************ */
    /* ************************************ */
    const saveGroup = new View('paintlib-menu-group');

    if (this.paintlib.haveAction(PaintActionType.CANCEL)) {
      saveGroup.add(new ActionButton(this.paintlib, () => new CancelAction(this.paintlib), CancelSVG));
    }
    if (this.paintlib.haveAction(PaintActionType.SAVE)) {
      saveGroup.add(new ActionButton(this.paintlib, () => new SaveAction(this.paintlib), SaveSVG));
    }
    if (saveGroup['children'].length > 0) {
      actionsView.add(saveGroup);
    }

    this.add(actionsView);

    /* ************************************ */
    /* ************** OPTIONS ************* */
    /* ************************************ */
    this.optionsMenu = new View('paintlib-menu-line');

    // Update options value on option bar
    const fgColor = new ColorPickerButton(
      this.paintlib,
      (state) => state.selectedObject?.getOptions()?.fgColor,
      (state) => state.options.fgColor,
      (color) => {
        this.paintlib.uiStore.setState((old) => ({
          options: { ...old.options, fgColor: color },
        }));
      },
      false,
      ForegroundColorSVG,
    );
    const bgColor = new ColorPickerButton(
      this.paintlib,
      (state) => state.selectedObject?.getOptions()?.bgColor,
      (state) => state.options.bgColor,
      (color) => {
        this.paintlib.uiStore.setState((old) => ({
          options: { ...old.options, bgColor: color },
        }));
      },
      true,
      BackgroundColorSVG,
    );
    const tickness = new TicknessPickerButton(this.paintlib, ThicknessSVG);

    this.options = { fgColor, bgColor, tickness };
    this.optionsMenu.add(new ActionGroup([fgColor, bgColor, tickness]));
    this.add(this.optionsMenu);

    // Set options bar depending on selected tool & proactivelyShowOptions options
    useState(
      this.paintlib.uiStore,
      (store) => store.activeAction,
      (action) => {
        this.updateOptions(action);
      },
    );

    useState(
      this.paintlib.uiStore,
      (store) => store.selectedObject,
      (selected) => {
        trash?.setDisable(!selected);
        this.updateOptions(selected ? (selected.constructor as any) : PaintActionType.SELECT);
      },
    );

    // Set undo/redo enable
    if (undo) {
      useState(
        this.paintlib.uiStore,
        (store) => store.canUndo,
        (canUndo) => {
          undo.setDisable(!canUndo);
        },
      );
    }
    if (redo) {
      useState(
        this.paintlib.uiStore,
        (store) => store.canRedo,
        (canRedo) => redo.setDisable(!canRedo),
      );
    }

    // Action shortcut
    document.addEventListener('keydown', this.keydownEvent);
  }

  private keydownEvent = (event: KeyboardEvent) => {
    const selectedObj = this.paintlib.getSelectedObject();
    if (selectedObj instanceof PaintText) {
      if (selectedObj['fabricObject'].isEditing) {
        return;
      }
    }

    const ctrl = xor(event.ctrlKey, event.metaKey);
    const key = event.key.toLowerCase();

    if (ctrl && key === 'z') {
      if (event.shiftKey) {
        if (this.paintlib.haveAction(PaintActionType.UNDO)) {
          this.paintlib.uiStore.getState().setAction(new UndoRedoAction(this.paintlib, 'redo'));
        }
      } else {
        if (this.paintlib.haveAction(PaintActionType.REDO)) {
          this.paintlib.uiStore.getState().setAction(new UndoRedoAction(this.paintlib, 'undo'));
        }
      }
    }

    if (key === 'delete' || key === 'backspace') {
      if (this.paintlib.haveAction(PaintActionType.TRASH)) {
        this.paintlib.uiStore.getState().setAction(new TrashAction(this.paintlib));
      }
    }
  };

  unmount() {
    for (const child of this.children) {
      if (child instanceof MenuButton) {
        child.unmount();
      }
    }
    document.removeEventListener('keydown', this.keydownEvent);
  }

  updateOptions = (actionOrClazz: PaintActionType | PaintObjectClass) => {
    const meta = ObjectRegistry.getObjectMeta(actionOrClazz);
    const action = (meta?.action || actionOrClazz) as PaintActionType;

    if (this.paintlib.customization?.proactivelyShowOptions) {
      const available: DrawingOption[] = meta?.allowedOptions;

      for (const key of Object.values(DrawingOption)) {
        // Keep option visible when whole bar is hidden to keep the size
        this.options[key].setVisible(!!available && available.includes(key));
      }

      this.optionsMenu.setVisible(available?.length > 0);
    }

    this.options.fgColor.setImage(action === PaintActionType.TEXT ? TextColorSVG : ForegroundColorSVG);
  };
}
