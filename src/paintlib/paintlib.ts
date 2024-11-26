import { BasicTransformEvent, Canvas, FabricImage, FabricObject, Point, TPointerEvent, Transform, util } from 'fabric';
import { calculateImageScaleToFitViewport } from './utils/size-utils';
import { MainMenu } from './components/main-menu';
import { createUIStore, UIStore } from './store/ui-store';
import { StoreApi } from 'zustand/vanilla';
import { PaintlibCustomization } from './models/paintlib-customization';
import { useState } from './utils/use-state';
import { DrawAction } from './actions/draw-action';
import { PaintObject } from './objects/abstract/paint-object';
import { UIActionType } from './config/ui-action-type';
import { getUrlExtension, px, setCssProperty } from './utils/utils';
import { CanvasSerializedJson } from './models/canvas-serialized-json';
import { PaintlibLoadOptions } from './models/paintlib-load-options';
import { GlobalTransformProps } from './models/global-transform-props';
import { ObjectRegistry } from './config/object-registry';
import { Size } from './models/size';
import { Checkpoint } from './models/checkpoint';

export class PaintLib {
  public readonly element: HTMLDivElement;

  public canvas: Canvas;
  public readonly uiStore: StoreApi<UIStore>;

  private canvasEl: HTMLCanvasElement;
  private canvasContainer: HTMLDivElement;
  private image?: FabricImage;
  private options?: PaintlibLoadOptions;
  private realSize?: Size;

  private objects: PaintObject<any>[] = [];
  private transform: GlobalTransformProps = { scale: 1, rotation: 0 };

  private undoStack: Checkpoint[];
  private redoStack: Checkpoint[];

  constructor(
    public readonly container: HTMLElement,
    public readonly customization: PaintlibCustomization = {},
  ) {
    // default style
    customization.style ??= {};
    setCssProperty(customization.style, 'backgroundColor', '--paintlib-background-color', '#c0c0c0');
    setCssProperty(customization.style, 'menuColor', '--paintlib-menu-color', '#222831');
    setCssProperty(customization.style, 'iconColor', '--paintlib-icon-color', '#c0c0c0');
    setCssProperty(customization.style, 'iconSize', '--paintlib-icon-size', 24);
    setCssProperty(customization.style, 'buttonSize', '--paintlib-button-size', 40);
    setCssProperty(customization.style, 'buttonGap', '--paintlib-button-gap', 6);
    setCssProperty(customization.style, 'groupGap', '--paintlib-group-gap', 20);
    // -------------

    this.element = document.createElement('div');
    this.uiStore = createUIStore(this);

    container.appendChild(this.element);

    // 1. Create root container
    this.element.className = 'paintlib-root';

    // 2. Create menu
    const mainMenu = new MainMenu(this);
    mainMenu.init();
    this.element.appendChild(mainMenu.element);

    // 3. Create & Populate canvas
    this.canvasContainer = document.createElement('div');
    this.canvasContainer.className = 'paintlib-canvas-container';
    this.canvasContainer.style.marginTop = px(
      this.customization.proactivelyShowOptions
        ? this.customization.style.buttonSize
        : 2 * this.customization.style.buttonSize + 10,
    );

    this.element.appendChild(this.canvasContainer);

    this.canvasEl = document.createElement('canvas');
    this.canvasEl.width = this.canvasContainer.clientWidth;
    this.canvasEl.height = this.canvasContainer.clientHeight;
    this.canvasContainer.appendChild(this.canvasEl);

    this.canvas = new Canvas(this.canvasEl);
    this.canvas.selection = false;
    this.canvas.defaultCursor = 'pointer';

    // 4. Manage event
    let isDragging = false;
    this.canvas.on('mouse:down', (event) => {
      isDragging = true;
      const state = this.uiStore.getState();
      const action = state.allActions[state.activeAction];

      if (action) {
        action.onMouseDown(event);
      }
    });
    this.canvas.on('mouse:move', (event) => {
      if (isDragging) {
        const state = this.uiStore.getState();
        const action = state.allActions[state.activeAction];

        if (action) {
          action.onMouseMove(event);
        }
      }
    });
    this.canvas.on('mouse:up', (event) => {
      if (isDragging) {
        isDragging = false;
        const state = this.uiStore.getState();
        const action = state.allActions[state.activeAction];

        if (action) {
          action.onMouseUp(event);
        }
      }
    });

    const selectionEvent = () => {
      const selected = this.getSelectedObject();
      this.uiStore.setState({ selectedObject: selected });
    };

    this.canvas.on('selection:created', selectionEvent);
    this.canvas.on('selection:updated', selectionEvent);
    this.canvas.on('selection:cleared', selectionEvent);

    // 5. Bind change to PaintObject
    let currTransform: Transform = undefined;
    const bindFabricToPaintlibObject = (event: BasicTransformEvent<TPointerEvent> & { target: FabricObject }) => {
      const target = event.target;
      const obj = this.objects.find((x) => x['fabricObject'] === target);
      if (obj) {
        if (currTransform !== event.transform) {
          currTransform = event.transform;
          this.saveCheckpoint(obj);
        }

        const realPos = this.getRealPosFromCanvas(new Point(target.left, target.top));
        const layout = obj.getLayout();
        obj.updateLayout(
          {
            left: realPos.x,
            top: realPos.y,
            width: layout.width,
            height: layout.height,
          },
          obj.getVector(),
        );

        obj.setTransform({
          scaleX: (target.scaleX / this.transform.scale) * (target.flipX ? -1 : 1),
          scaleY: (target.scaleY / this.transform.scale) * (target.flipY ? -1 : 1),
          rotation: target.angle - this.transform.rotation,
        });
      }
    };

    this.canvas.on('object:moving', bindFabricToPaintlibObject);
    this.canvas.on('object:scaling', bindFabricToPaintlibObject);
    this.canvas.on('object:rotating', bindFabricToPaintlibObject);

    // 6. Update selected object with option on change
    const updateFactory = (field: string) => {
      return (newValue: any) => {
        if (this.uiStore.getState().activeAction === UIActionType.DRAW) {
          (this.uiStore.getState().allActions[UIActionType.DRAW] as DrawAction).update();
        }
        const selectedObj = this.getSelectedObject();
        if (selectedObj) {
          console.log('ICI: ', selectedObj.getOptions());
          this.saveCheckpoint(selectedObj);
          console.log('===');
          selectedObj.setOptions({ [field]: newValue });
          selectedObj.update(this);
          this.canvas.renderAll();
        }
      };
    };

    useState(this.uiStore, (store) => store.options.fgColor, updateFactory('fgColor'));
    useState(this.uiStore, (store) => store.options.bgColor, updateFactory('bgColor'));
    useState(this.uiStore, (store) => store.options.tickness, updateFactory('tickness'));
  }

  /* ************************************ */
  /* ********** LOAD CANVAS ********** */
  /* ************************************ */

  /**
   * Load the canvas with image or freedrawing.
   * @param options
   */
  async load(options: PaintlibLoadOptions) {
    // TODO: Why not included in constructor ?
    if (options.image && (options.width || options.height)) {
      throw new Error(`You cannot an image and specifying the size`);
    }

    if (this.realSize) {
      // Already loaded, clear first
      this.clear();
    }

    this.options = options;
    if (options.image) {
      this.image = await FabricImage.fromURL(options.image, { crossOrigin: 'anonymous' });

      this.image.hasControls = false;
      this.image.selectable = false;
      this.image.lockMovementX = true;
      this.image.lockMovementY = true;
      this.image.moveCursor = 'pointer';
      this.image.hoverCursor = 'pointer';
    }
    this.canvas.backgroundColor = '#ffffff';

    // Auto-detect format if possible (else fallback png)
    if (!options.format) {
      const ext = options.image ? getUrlExtension(options.image).toLowerCase() : null;
      if (ext === 'jpg' || ext === 'jped') {
        this.options.format = 'jpeg';
      } else {
        this.options.format = 'png';
      }
    }
    // --------------------------------------------------

    const usedSize: Size = this.image ?? {
      width: options.width ?? this.canvasContainer.clientWidth,
      height: options.height ?? this.canvasContainer.clientHeight,
    };
    const { width, height, scale } = calculateImageScaleToFitViewport(
      { width: this.canvas.width, height: this.canvas.height },
      { width: usedSize.width, height: usedSize.height },
    );

    this.canvas.setDimensions({ width, height });

    if (this.options.imageSizeMode === 'real') {
      this.realSize = { width: usedSize.width, height: usedSize.height };
    } else {
      this.realSize = { width, height };
    }
    this.transform.scale = width / this.realSize.width;

    if (this.image) {
      this.image.scale(scale);
      this.canvas.add(this.image);
      this.canvas.centerObject(this.image);
    }

    if (options.restoreData) {
      this.restore(JSON.parse(atob(options.restoreData)));
    }

    this.enableSelection(true);

    this.undoStack = [];
    this.redoStack = [];

    new ResizeObserver(this.fitViewport).observe(this.container);
  }

  /* ******************************************* */
  /* ********** GLOBAL TRANSFORMATION ********** */
  /* ******************************************* */

  setRotation(rotation: number) {
    this.canvas.discardActiveObject();

    // 1. Convert rotation to be between 0 and 360
    if (rotation % 90 !== 0) {
      throw new Error(`PaintLib.setRotation only work with multiple of 90`);
    }
    rotation = rotation % 360;
    if (rotation < 0) {
      rotation = rotation + 360;
    }

    // 2. Calculate new canvas dimension
    const containerWidth = this.canvasContainer.clientWidth;
    const containerHeight = this.canvasContainer.clientHeight;
    const usedSize: Size = this.image ?? this.realSize;

    const {
      width: canvasWidth,
      height: canvasHeight,
      scale: imgScale,
    } = calculateImageScaleToFitViewport(
      { width: containerWidth, height: containerHeight },
      {
        width: rotation % 180 === 0 ? usedSize.width : usedSize.height,
        height: rotation % 180 === 0 ? usedSize.height : usedSize.width,
      },
    );

    this.canvas.setDimensions({ width: canvasWidth, height: canvasHeight });

    if (this.image) {
      this.image.scale(imgScale);
      this.image.rotate(rotation);
      this.canvas.centerObject(this.image);
    }

    // 3. Apply new global scale to objects
    const newWidth = rotation % 180 === 0 ? this.canvas.width : this.canvas.height;
    const objScale = newWidth / this.realSize.width;
    this.setGlobalTransform({
      scale: objScale,
      rotation,
    });
  }

  private fitViewport = () => {
    this.canvas.discardActiveObject();

    const containerWidth = this.canvasContainer.clientWidth;
    const containerHeight = this.canvasContainer.clientHeight;

    const usedSize: Size = this.image ?? this.realSize;

    const {
      width: canvasWidth,
      height: canvasHeight,
      scale: imgScale,
    } = calculateImageScaleToFitViewport(
      { width: containerWidth, height: containerHeight },
      {
        width: this.transform.rotation % 180 === 0 ? usedSize.width : usedSize.height,
        height: this.transform.rotation % 180 === 0 ? usedSize.height : usedSize.width,
      },
    );

    this.canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
    if (this.image) {
      this.image.scale(imgScale);
      this.canvas.centerObject(this.image);
    }

    const newWidth = this.transform.rotation % 180 === 0 ? canvasWidth : canvasHeight;
    this.setGlobalTransform({ scale: newWidth / this.realSize.width });
  };

  private setGlobalTransform(props: Partial<GlobalTransformProps>) {
    (this.uiStore.getState().allActions[UIActionType.DRAW] as DrawAction)?.update();
    this.transform = Object.assign(this.transform, props);
    for (const obj of this.objects) {
      obj.update(this);
    }
    this.canvas.renderAll();
  }

  /* ************************************** */
  /* ********** OBJECT SELECTION ********** */
  /* ************************************** */

  getSelectedObject() {
    const selected = this.canvas.getActiveObject();
    return this.objects.find((x) => x['fabricObject'] === selected);
  }

  enableSelection(enable: boolean) {
    this.canvas.forEachObject((object) => {
      if (!(object instanceof FabricImage)) {
        object.hasControls = enable;
        object.selectable = enable;
        object.lockMovementY = !enable;
        object.lockMovementX = !enable;
        object.lockRotation = !enable;

        if (enable) {
          // Apparently selection may not be enabled back if this is not called
          this.canvas.setActiveObject(object);
        }
      }
    });

    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }

  /* ****************************************** */
  /* ********** ADD & REMOVE objects ********** */
  /* ****************************************** */

  add(object: PaintObject<any>) {
    this.objects.push(object);
    object.bind(this);
    if (!this.canvas.contains(object['fabricObject'])) {
      // Can be already on canvas in the case of PaintDraw
      this.canvas.add(object['fabricObject']);
    }
    object.update(this);
  }

  remove(object: PaintObject<any>) {
    this.objects = this.objects.filter((x) => x !== object);
    this.canvas.remove(object['fabricObject']);
  }

  /* ****************************************** */
  /* ***************** CLEAR  ***************** */
  /* ****************************************** */
  public clear() {
    this.canvas.clear();
    this.canvas.backgroundColor = '#ffffff';
    this.objects = [];
    this.undoStack = [];
    this.redoStack = [];
  }

  /* ****************************************** */
  /* ************** UNDO / REDO  ************** */
  /* ****************************************** */
  private updateCanUndoRedoState() {
    this.uiStore.setState({ canRedo: this.redoStack.length > 0, canUndo: this.undoStack.length > 0 });
  }

  private buildCheckpoint(object?: PaintObject<any>, creation?: boolean): Checkpoint {
    if (object) {
      const objExists = !!this.objects.find((x) => x === object);
      if (objExists && !creation) {
        return { type: 'object', checkpoint: object.saveCheckpoint() };
      } else {
        return {
          type: 'object',
          checkpoint: { object, layout: null, vector: null, options: null, transform: null },
        };
      }
    } else {
      return { type: 'canvas', checkpoint: { transform: this.getTransform() } };
    }
  }

  private restoreCheckpoint(checkpoint: Checkpoint) {
    if (checkpoint.type === 'canvas') {
      if (this.transform.rotation !== checkpoint.checkpoint.transform.rotation) {
        this.setRotation(checkpoint.checkpoint.transform.rotation);
      }
    } else {
      const obj = checkpoint.checkpoint.object;

      if (checkpoint.checkpoint.layout) {
        const objExists = !!this.objects.find((x) => x === obj);
        if (!objExists) {
          // We don't find the object -> recreate it
          obj.create(
            new Point(checkpoint.checkpoint.layout.left, checkpoint.checkpoint.layout.top),
            checkpoint.checkpoint.extras,
          );
        }

        obj.setTransform(checkpoint.checkpoint.transform);
        obj.setOptions(checkpoint.checkpoint.options);
        obj.restoreExtras(checkpoint.checkpoint.extras);
        obj.updateLayout(checkpoint.checkpoint.layout, checkpoint.checkpoint.vector);
        obj.update(this);

        if (!objExists) {
          this.add(obj);
        }
      } else {
        this.remove(obj);
      }
      this.canvas.renderAll();
    }
  }

  discardLastCheckpoint() {
    this.undoStack.pop();
    this.updateCanUndoRedoState();
  }

  saveCheckpoint(object?: PaintObject<any>, creation?: boolean) {
    this.undoStack.push(this.buildCheckpoint(object, creation));

    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }

    this.redoStack = [];
    this.updateCanUndoRedoState();
  }

  undo() {
    const checkpoint = this.undoStack.pop();
    if (!checkpoint) {
      return;
    }

    // 1. Save the current state to redo stack
    this.redoStack.push(this.buildCheckpoint(checkpoint.type === 'object' ? checkpoint.checkpoint.object : undefined));

    // 2. Restore the object or canvas
    this.restoreCheckpoint(checkpoint);
    this.updateCanUndoRedoState();
  }

  redo() {
    const checkpoint = this.redoStack.pop();
    if (!checkpoint) {
      return;
    }

    // 1. Save the current state to undo stack
    this.undoStack.push(this.buildCheckpoint(checkpoint.type === 'object' ? checkpoint.checkpoint.object : undefined));

    // 2. Restore the object or canvas
    this.restoreCheckpoint(checkpoint);
    this.updateCanUndoRedoState();
  }

  /* ************************************ */
  /* ********** SAVE & RESTORE ********** */
  /* ************************************ */

  private restore(data: CanvasSerializedJson) {
    for (const objData of data.objects) {
      const obj = ObjectRegistry.restoreObject(objData);
      this.add(obj);
    }

    const scale = this.canvas.width / data.width;
    this.setGlobalTransform({ scale: scale * this.transform.scale });
    if (data.transform.rotation) {
      this.setRotation(data.transform.rotation);
    }

    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Return the base64 URL encoded image
   */
  getDataURL() {
    const canvasWidth = this.transform.rotation % 180 === 0 ? this.canvas.width : this.canvas.height;
    const scale = (this.image?.width ?? this.realSize.width) / canvasWidth;

    return this.canvas.toDataURL({ format: this.options.format, multiplier: scale });
  }

  /**
   * Return the image in base64 format
   */
  getBase64() {
    const dataURL = this.getDataURL();
    const regex = /^data:.*?;base64,(.*)$/;
    const match = dataURL.match(regex);
    return match ? match[1] : undefined;
  }

  /**
   * Start a download for the image
   *
   * @param filename
   */
  downloadImage(filename: string) {
    const link = document.createElement('a');
    link.href = this.getDataURL();
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  serialize(): CanvasSerializedJson {
    return {
      width: this.transform.rotation % 180 === 0 ? this.realSize.width : this.realSize.height,
      height: this.transform.rotation % 180 === 0 ? this.realSize.width : this.realSize.width,
      transform: { rotation: this.transform.rotation },
      objects: this.objects.map((x) => x.serialize()),
    };
  }

  /* ************************************ */
  /* ********** POSITION UTILS ********** */
  /* ************************************ */

  /**
   * Return the reference from which object are positioned, relative to canvas
   * @private
   */
  private getReferencePoint() {
    let x = 0;
    let y = 0;

    if (this.transform.rotation === 90) {
      // height because realSize is fixed (so in case 90º rotation, realSize.height is actually width)
      x = this.realSize.height;
    } else if (this.transform.rotation === 180) {
      x = this.realSize.width;
      y = this.realSize.height;
    } else if (this.transform.rotation === 270) {
      // width because realSize is fixed (so in case 270º rotation, realSize.width is actually height)
      y = this.realSize.width;
    }

    return new Point(x, y);
  }

  /**
   * Convert real position to canvas position.
   */
  getCanvasPosFromReal(realPos: Point) {
    const reference = this.getReferencePoint();
    return realPos
      .rotate(util.degreesToRadians(this.transform.rotation))
      .add(reference)
      .scalarMultiply(this.transform.scale);
  }

  /**
   * Convert canvas position to real position.
   */
  getRealPosFromCanvas(canvasPos: Point) {
    const reference = this.getReferencePoint();
    return canvasPos
      .scalarDivide(this.transform.scale)
      .subtract(reference)
      .rotate(-util.degreesToRadians(this.transform.rotation));
  }

  /* ************************************ */
  /* ********** RANDOM GETTERS ********** */
  /* ************************************ */
  getPalette() {
    if (!this.customization?.palette) {
      return [
        '#FF0000', // Red
        '#FFA500', // Orange
        '#FFD700', // Yellow (gold)
        '#008000', // Green
        '#4169E1', // Blue (royal)
        '#808080', // Gray
        '#FFFFFF', // White
        '#000000', // Dark
      ];
    }
    return this.customization.palette;
  }

  getAvailableTickness() {
    if (!this.customization?.tickness) {
      return [1, 2, 3, 5, 10];
    }
    return this.customization.tickness;
  }

  getTransform(): GlobalTransformProps {
    return { ...this.transform };
  }

  getOptions(): PaintlibLoadOptions {
    return { ...this.options };
  }
}
