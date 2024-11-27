import CursorSVG from '../svgs/cursor.svg';
import TrashSVG from '../svgs/trash.svg';
import UndoSVG from '../svgs/undo.svg';
import RedoSVG from '../svgs/redo.svg';
import RotateLeftSVG from '../svgs/rotate-left.svg';
import RotateRightSVG from '../svgs/rotate-right.svg';
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
import { UIActionType } from '../config/ui-action-type';
import { DrawingOption } from '../config/drawing-option';
import { ObjectRegistry, PaintObjectClass } from '../config/object-registry';
import { PaintText } from '../objects/paint-text';

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

    const select = new ActionButton(this.paintlib, () => new SelectAction(this.paintlib), CursorSVG);
    const trash = new ActionButton(this.paintlib, () => new TrashAction(this.paintlib), TrashSVG);
    const undo = new ActionButton(this.paintlib, () => new UndoRedoAction(this.paintlib, 'undo'), UndoSVG);
    const redo = new ActionButton(this.paintlib, () => new UndoRedoAction(this.paintlib, 'redo'), RedoSVG);

    const cancel = new ActionButton(this.paintlib, () => new CancelAction(this.paintlib), CancelSVG);
    const save = new ActionButton(this.paintlib, () => new SaveAction(this.paintlib), SaveSVG);

    actionsView.add(new ActionGroup([select, trash, undo, redo]));
    actionsView.add(new CreateObjectMenuGroup(this.paintlib));
    if (this.paintlib.customization?.allowRotate) {
      const rotateLeft = new ActionButton(this.paintlib, () => new RotateAction(this.paintlib, 'left'), RotateLeftSVG);
      const rotateRight = new ActionButton(
        this.paintlib,
        () => new RotateAction(this.paintlib, 'right'),
        RotateRightSVG,
      );
      actionsView.add(new ActionGroup([rotateLeft, rotateRight]));
    }
    actionsView.add(new ActionGroup([cancel, save]));
    this.add(actionsView);

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
        trash.setDisable(!selected);
        this.updateOptions(selected ? (selected.constructor as any) : UIActionType.SELECT);
      },
    );

    // Action shortcut
    document.addEventListener('keydown', (event) => {
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
          this.paintlib.uiStore.getState().setAction(new UndoRedoAction(this.paintlib, 'redo'));
        } else {
          this.paintlib.uiStore.getState().setAction(new UndoRedoAction(this.paintlib, 'undo'));
        }
      }

      if (key === 'delete' || key === 'backspace') {
        this.paintlib.uiStore.getState().setAction(new TrashAction(this.paintlib));
      }
    });
  }

  updateOptions = (actionOrClazz: UIActionType | PaintObjectClass) => {
    const meta = ObjectRegistry.getObjectMeta(actionOrClazz);
    const action = (meta?.action || actionOrClazz) as UIActionType;

    if (this.paintlib.customization?.proactivelyShowOptions) {
      const available: DrawingOption[] = meta?.allowedOptions;

      for (const key of Object.values(DrawingOption)) {
        // Keep option visible when whole bar is hidden to keep the size
        this.options[key].setVisible(!!available && available.includes(key));
      }

      this.optionsMenu.setVisible(available?.length > 0);
    }

    this.options.fgColor.setImage(action === UIActionType.TEXT ? TextColorSVG : ForegroundColorSVG);
  };
}
