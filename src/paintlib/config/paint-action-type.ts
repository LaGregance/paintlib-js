export enum PaintActionType {
  SELECT = 'select',
  TRASH = 'trash',
  SAVE = 'save',
  CANCEL = 'cancel',

  UNDO = 'undo',
  REDO = 'redo',

  RECT = 'rect',
  ELLIPSE = 'ellipse',
  LINE = 'line',
  ARROW = 'arrow',
  DRAW = 'draw',
  TEXT = 'text',

  ROTATE_LEFT = 'rotate-left',
  ROTATE_RIGHT = 'rotate-right',
  CROP = 'crop',
}

export class PaintActionBuilder {
  private actions: PaintActionType[];

  constructor() {
    this.actions = [];
  }

  add(...actions: PaintActionType[]) {
    for (const action of actions) {
      if (!this.actions.includes(action)) {
        this.actions.push(action);
      }
    }
  }

  remove(...actions: PaintActionType[]) {
    this.actions = this.actions.filter((action) => !actions.includes(action));
  }

  /**
   * Add all actions
   */
  all(): PaintActionBuilder {
    this.actions = Object.values(PaintActionType);
    return this;
  }

  /**
   * Add basics actions (select, trash, save, cancel)
   */
  basics(): PaintActionBuilder {
    this.add(PaintActionType.SELECT, PaintActionType.TRASH, PaintActionType.SAVE, PaintActionType.CANCEL);
    return this;
  }

  /**
   * Add rotate action
   *
   * @params side if defined only add rotate action for the selected side
   */
  rotate(side?: 'left' | 'right'): PaintActionBuilder {
    if (side === 'left') {
      this.add(PaintActionType.ROTATE_LEFT);
    } else if (side === 'right') {
      this.add(PaintActionType.ROTATE_RIGHT);
    } else {
      this.add(PaintActionType.ROTATE_LEFT, PaintActionType.ROTATE_RIGHT);
    }
    return this;
  }

  /**
   * Add undo action (and optionally redo)
   *
   * @params addRedo add redo action if true
   */
  undo(addRedo?: boolean): PaintActionBuilder {
    this.add(PaintActionType.UNDO);
    if (addRedo) {
      this.add(PaintActionType.REDO);
    }
    return this;
  }

  /**
   * Add crop action
   */
  crop(): PaintActionBuilder {
    this.add(PaintActionType.CROP);
    return this;
  }

  /**
   * Add save action (and optionally cancel)
   *
   * @params addCancel add cancel action if true
   */
  save(addCancel?: boolean): PaintActionBuilder {
    this.add(PaintActionType.SAVE);
    if (addCancel) {
      this.add(PaintActionType.CANCEL);
    }
    return this;
  }

  /**
   * Add all objects action (rect, ellipse, line, arrow, draw, text)
   */
  objects(): PaintActionBuilder {
    this.add(
      PaintActionType.RECT,
      PaintActionType.ELLIPSE,
      PaintActionType.LINE,
      PaintActionType.ARROW,
      PaintActionType.TEXT,
      PaintActionType.DRAW,
    );
    return this;
  }

  /**
   * Build the action array
   */
  build() {
    return this.actions;
  }
}
