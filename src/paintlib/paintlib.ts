import {
  BasicTransformEvent,
  Canvas,
  FabricImage,
  FabricObject,
  Point,
  TBBox,
  TPointerEvent,
  Transform,
  util,
} from 'fabric';
import { calculateCanvasSizeToFitViewport } from './utils/size-utils';
import { MainMenu } from './components/main-menu';
import { createUIStore, UIStore } from './store/ui-store';
import { StoreApi } from 'zustand/vanilla';
import { PaintlibCustomization } from './models/paintlib-customization';
import { useState } from './utils/use-state';
import { DrawAction } from './actions/draw-action';
import { PaintObject } from './objects/abstract/paint-object';
import { PaintActionType } from './models/paint-action-type';
import { boxEqual, getUrlFileType, px, setCssProperty } from './utils/utils';
import { CanvasSerializedJson } from './models/canvas-serialized-json';
import { PaintlibLoadOptions } from './models/paintlib-load-options';
import { GlobalTransformProps } from './models/global-transform-props';
import { ObjectRegistry } from './config/object-registry';
import { Size } from './models/size';
import { Checkpoint } from './models/checkpoint';
import { CropMenu } from './crop/crop-menu';
import { CropFeature } from './crop/crop-feature';
import { SelectAction } from './actions/select-action';

export class PaintLib {
  public readonly element: HTMLDivElement;

  private mainMenu: MainMenu;

  private cropMenu: CropMenu;
  private cropFeature: CropFeature;
  private ignoreSelectionEvent = false;

  public canvas: Canvas;
  public readonly uiStore: StoreApi<UIStore>;

  private canvasEl: HTMLCanvasElement;
  private canvasContainer: HTMLDivElement;
  private image?: FabricImage;
  private options?: PaintlibLoadOptions;

  private realSize?: Size;
  private resizeObserver: ResizeObserver;

  private objects: PaintObject<any>[];
  private transform: GlobalTransformProps;

  private undoStack: Checkpoint[];
  private redoStack: Checkpoint[];

  constructor(
    public readonly container: HTMLElement,
    public readonly customization: PaintlibCustomization = {},
  ) {
    // default customization
    customization.style ??= {};
    setCssProperty(customization.style, 'backgroundColor', '--paintlib-background-color', '#c0c0c0');
    setCssProperty(customization.style, 'menuColor', '--paintlib-menu-color', '#222831');
    setCssProperty(customization.style, 'iconColor', '--paintlib-icon-color', '#c0c0c0');
    setCssProperty(customization.style, 'iconSize', '--paintlib-icon-size', 24);
    setCssProperty(customization.style, 'buttonSize', '--paintlib-button-size', 40);
    setCssProperty(customization.style, 'buttonGap', '--paintlib-button-gap', 6);
    setCssProperty(customization.style, 'groupGap', '--paintlib-group-gap', 20);

    if (!customization.actions) {
      customization.actions = Object.values(PaintActionType);
    }
    // -------------

    this.element = document.createElement('div');
    this.uiStore = createUIStore(this);

    container.appendChild(this.element);

    // 1. Create root container
    this.element.className = 'paintlib-root';

    // 2. Create menu
    this.mainMenu = new MainMenu(this);
    this.mainMenu.init();
    this.element.appendChild(this.mainMenu.element);

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
    this.canvasContainer.style.visibility = 'hidden';

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
      if (this.ignoreSelectionEvent || !this.objects) {
        return;
      }

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

        if (this.transform) {
          obj.setTransform({
            scaleX: (target.scaleX / this.transform.scale) * (target.flipX ? -1 : 1),
            scaleY: (target.scaleY / this.transform.scale) * (target.flipY ? -1 : 1),
            rotation: target.angle - this.transform.rotation,
          });
        }
      }
    };

    this.canvas.on('object:moving', bindFabricToPaintlibObject);
    this.canvas.on('object:scaling', bindFabricToPaintlibObject);
    this.canvas.on('object:rotating', bindFabricToPaintlibObject);

    // 6. Update selected object with option on change
    const updateFactory = (field: string) => {
      return (newValue: any) => {
        if (this.uiStore.getState().activeAction === PaintActionType.DRAW) {
          (this.uiStore.getState().allActions[PaintActionType.DRAW] as DrawAction).update();
        }

        if (this.objects) {
          const selectedObj = this.getSelectedObject();
          if (selectedObj) {
            this.saveCheckpoint(selectedObj);
            selectedObj.setOptions({ [field]: newValue });
            selectedObj.update(this);
            this.canvas.renderAll();
          }
        }
      };
    };

    useState(this.uiStore, (store) => store.options.fgColor, updateFactory('fgColor'));
    useState(this.uiStore, (store) => store.options.bgColor, updateFactory('bgColor'));
    useState(this.uiStore, (store) => store.options.tickness, updateFactory('tickness'));

    // Observe unmount
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node === this.element) {
              this.unmount();
              observer.disconnect();
            }
          });
        }
      }
    });
    observer.observe(this.element.parentNode, { childList: true });
  }

  /* ************************************ */
  /* ********** LOAD CANVAS ********** */
  /* ************************************ */

  /**
   * Load the canvas with image or freedrawing.
   * @param options
   */
  async load(options: PaintlibLoadOptions) {
    if (options.image && (options.width || options.height)) {
      throw new Error(`You cannot an image and specifying the size`);
    }

    if (this.realSize) {
      // Already loaded, reset first
      this.reset();
    }

    this.objects = [];
    this.transform = { scale: 1, rotation: 0 };

    this.options = options;
    if (options.image) {
      this.image = await FabricImage.fromURL(options.image, { crossOrigin: 'anonymous' });

      this.image.hasControls = false;
      this.image.selectable = false;
      this.image.lockMovementX = true;
      this.image.lockMovementY = true;
      this.image.moveCursor = 'pointer';
      this.image.hoverCursor = 'pointer';

      this.canvas.add(this.image);
    }
    this.canvasContainer.style.visibility = 'visible';
    this.canvas.backgroundColor = '#ffffff';

    // Auto-detect format if possible (else fallback png)
    if (!options.format) {
      const ext = options.image ? getUrlFileType(options.image).toLowerCase() : null;
      if (ext === 'jpg' || ext === 'jpeg') {
        this.options.format = 'jpeg';
      } else {
        this.options.format = 'png';
      }
    }
    // --------------------------------------------------

    // TODO: Maybe we should use options.width in priority than image size
    const usedSize: Size = this.image ?? {
      width: options.width ?? this.canvasContainer.clientWidth,
      height: options.height ?? this.canvasContainer.clientHeight,
    };
    const { width, height } = calculateCanvasSizeToFitViewport(
      { width: this.canvasContainer.clientWidth, height: this.canvasContainer.clientHeight },
      { width: usedSize.width, height: usedSize.height },
    );
    this.canvas.setDimensions({ width, height });

    if (this.options.imageSizeMode === 'real') {
      this.realSize = { width: usedSize.width, height: usedSize.height };
    } else {
      this.realSize = { width, height };
    }
    if (options.restoreData) {
      this.restore(JSON.parse(atob(options.restoreData)));
    }

    this.transform.scale = width / this.realSize.width;

    this.enableSelection(this.uiStore.getState().activeAction === PaintActionType.SELECT);

    this.undoStack = [];
    this.redoStack = [];

    this.resizeObserver = new ResizeObserver(this.calcCanvasSize);
    this.resizeObserver.observe(this.container);
  }

  /* ******************************************* */
  /* ********** GLOBAL TRANSFORMATION ********** */
  /* ******************************************* */

  /**
   * This function is responsive to calculate the canvas size and adjusting the scale by take multiple things into account:
   *  - viewPort sizes
   *  - image size (or realSize)
   *  - rotation
   *  - crop
   *
   * @private
   */
  private calcCanvasSize = () => {
    this.canvas.discardActiveObject();

    // 1. Calculate new canvas dimension
    const rotation = this.transform.rotation;
    const viewportWidth = this.canvasContainer.clientWidth;
    const viewportHeight = this.canvasContainer.clientHeight;

    const usedSize: Size = this.transform.crop ?? this.realSize;

    const { width: canvasWidth, height: canvasHeight } = calculateCanvasSizeToFitViewport(
      { width: viewportWidth, height: viewportHeight },
      {
        width: rotation % 180 === 0 ? usedSize.width : usedSize.height,
        height: rotation % 180 === 0 ? usedSize.height : usedSize.width,
      },
    );

    // 2. Apply dimension & scale
    this.canvas.setDimensions({ width: canvasWidth, height: canvasHeight });

    if (this.image) {
      const imageSize: Size = { width: this.image.width, height: this.image.height };

      if (this.transform.crop) {
        // Crop the image size relatively
        imageSize.width *= this.transform.crop.width / this.realSize.width;
        imageSize.height *= this.transform.crop.height / this.realSize.height;
      }

      const canvasSize: Size =
        this.transform.rotation % 180 === 0
          ? { width: canvasWidth, height: canvasHeight }
          : { width: canvasHeight, height: canvasWidth };

      const scaleX = canvasSize.width / imageSize.width;
      const scaleY = canvasSize.height / imageSize.height;
      const imgScale = Math.min(scaleX, scaleY);

      this.image.scale(imgScale);
      this.image.rotate(rotation);

      if (this.transform.rotation === 90) {
        this.image.left = canvasSize.height;
        this.image.top = 0;
      } else if (this.transform.rotation === 180) {
        this.image.left = canvasSize.width;
        this.image.top = canvasSize.height;
      } else if (this.transform.rotation === 270) {
        this.image.left = 0;
        this.image.top = canvasSize.width;
      } else {
        this.image.left = 0;
        this.image.top = 0;
      }

      if (this.transform.crop) {
        this.image.cropX = (canvasSize.width * this.transform.crop.left) / (imgScale * this.transform.crop.width);
        this.image.cropY = (canvasSize.height * this.transform.crop.top) / (imgScale * this.transform.crop.height);
      } else {
        this.image.cropX = 0;
        this.image.cropY = 0;
      }
    }

    const newWidth = rotation % 180 === 0 ? this.canvas.width : this.canvas.height;
    const objScale = newWidth / (this.transform.crop?.width ?? this.realSize.width);
    this.setGlobalTransform({ scale: objScale });

    if (this.cropFeature) {
      this.cropFeature.resizeCanvas(canvasWidth, canvasHeight);
    }
  };

  setRotation(rotation: number) {
    // 1. Convert rotation to be between 0 and 360
    if (rotation % 90 !== 0) {
      throw new Error(`PaintLib.setRotation only work with multiple of 90`);
    }
    rotation = rotation % 360;
    if (rotation < 0) {
      rotation = rotation + 360;
    }

    this.transform.rotation = rotation;
    this.calcCanvasSize();
  }

  public startCrop() {
    // 1. Restore original non-cropped image
    const originalCrop = this.transform.crop;
    this.cropImage(undefined);

    // 2. Create crop feature
    this.cropFeature = new CropFeature(this, originalCrop);

    // 3. Override menu
    this.cropMenu = new CropMenu(this, () => {
      this.element.removeChild(this.cropMenu.element);
      this.cropMenu = undefined;
      this.cropFeature = undefined;
      this.uiStore.getState().setAction(new SelectAction(this));
    });
    this.cropMenu.init();
    this.element.appendChild(this.cropMenu.element);
  }

  public cropImage(cropSection: TBBox | undefined) {
    this.cropFeature = undefined;
    this.transform.crop = cropSection;
    this.calcCanvasSize();
  }

  private setGlobalTransform(props: Partial<GlobalTransformProps>) {
    (this.uiStore.getState().allActions[PaintActionType.DRAW] as DrawAction)?.update();
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
    this.ignoreSelectionEvent = true;
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
    this.ignoreSelectionEvent = false;
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

  /**
   * Destroy everything related to paintlib
   */
  public destroy() {
    this.unmount();
    this.element.remove();
  }

  private unmount() {
    this.reset();
    this.mainMenu.unmount();
  }

  /**
   * Reset the canvas at the initial state (before load)
   * @private
   */
  private reset() {
    this.canvas.clear();
    this.canvas.backgroundColor = '#ffffff';
    this.canvasContainer.style.visibility = 'hidden';
    this.objects = [];
    this.transform = { scale: 1, rotation: 0 };
    this.undoStack = [];
    this.redoStack = [];
    this.uiStore.setState({
      canRedo: false,
      canUndo: false,
      activeAction: PaintActionType.SELECT,
    });

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }

  /**
   * Clear all the object from the canvas
   *
   * @param clearImage additionally clear the image if clearImage is true
   */
  public clear(clearImage = false) {
    this.ignoreSelectionEvent = true;
    this.canvas.discardActiveObject();
    for (const obj of this.objects) {
      this.remove(obj);
    }
    if (clearImage && this.image) {
      this.canvas.remove(this.image);
      this.image = undefined;
    }
    this.ignoreSelectionEvent = false;
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
      if (!boxEqual(this.transform.crop, checkpoint.checkpoint.transform.crop)) {
        this.cropImage(checkpoint.checkpoint.transform.crop);
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
    const scale = this.realSize.width / data.width;

    for (const objData of data.objects) {
      if (scale !== 1) {
        objData.layout.top *= scale;
        objData.layout.left *= scale;
        objData.layout.width *= scale;
        objData.layout.height *= scale;
      }
      const obj = ObjectRegistry.restoreObject(objData);
      this.add(obj);
    }

    this.setGlobalTransform({ crop: data.transform.crop });
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

  /**
   * Return the actual state in base64 format
   */
  saveState() {
    if (!this.transform.rotation && !this.transform.crop && this.objects.length <= 0) {
      return null;
    }

    const state: CanvasSerializedJson = {
      width: this.realSize.width,
      height: this.realSize.height,
      transform: { rotation: this.transform.rotation, crop: this.transform.crop },
      objects: this.objects.map((x) => x.serialize()),
    };
    return btoa(JSON.stringify(state));
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
      x = this.transform.crop?.height || this.realSize.height;
    } else if (this.transform.rotation === 180) {
      x = this.transform.crop?.width || this.realSize.width;
      y = this.transform.crop?.height || this.realSize.height;
    } else if (this.transform.rotation === 270) {
      // width because realSize is fixed (so in case 270º rotation, realSize.width is actually height)
      y = this.transform.crop?.width || this.realSize.width;
    }

    return new Point(x, y);
  }

  /**
   * Convert real position to canvas position.
   */
  getCanvasPosFromReal(realPos: Point) {
    const reference = this.getReferencePoint();
    return realPos
      .subtract(new Point(this.transform.crop?.left || 0, this.transform.crop?.top || 0))
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
      .rotate(-util.degreesToRadians(this.transform.rotation))
      .add(new Point(this.transform.crop?.left || 0, this.transform.crop?.top || 0));
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

  haveAction(action: PaintActionType) {
    return this.customization.actions.includes(action);
  }
}
