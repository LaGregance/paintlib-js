import { Canvas, FabricImage, Point, util } from 'fabric';
import { calculateImageScaleToFitViewport } from './utils/size-utils';
import { MainMenu } from './components/main-menu';
import { createUIStore, UIStore } from './store/ui-store';
import { StoreApi } from 'zustand/vanilla';
import { PaintlibGlobalOptions } from './models/paintlib-global-options';
import { useState } from './utils/use-state';
import { DrawAction } from './actions/draw-action';
import { PaintObject } from './objects/abstract/paint-object';
import { UIActionType } from './config/ui-action-type';
import { getUrlExtension, px, setCssProperty } from './utils/utils';
import { CanvasSerializedJson } from './models/canvas-serialized-json';
import { PaintlibLoadOptions } from './models/paintlib-load-options';
import { TransformProps } from './models/transform-props';

export class PaintLib {
  public readonly element: HTMLDivElement;

  public canvas: Canvas;
  public readonly uiStore: StoreApi<UIStore>;

  private canvasEl: HTMLCanvasElement;
  private canvasContainer: HTMLDivElement;
  private image?: FabricImage;
  private format?: 'png' | 'jpeg';
  private objects: PaintObject<any>[] = [];

  private transform: TransformProps = { scale: 1, rotation: 0 };

  constructor(
    public readonly container: HTMLElement,
    public readonly options: PaintlibGlobalOptions = {},
  ) {
    // default style
    options.style ??= {};
    setCssProperty(options.style, 'backgroundColor', '--paintlib-background-color', '#c0c0c0');
    setCssProperty(options.style, 'menuColor', '--paintlib-menu-color', '#222831');
    setCssProperty(options.style, 'iconColor', '--paintlib-icon-color', '#c0c0c0');
    setCssProperty(options.style, 'iconSize', '--paintlib-icon-size', 24);
    setCssProperty(options.style, 'buttonSize', '--paintlib-button-size', 40);
    setCssProperty(options.style, 'buttonGap', '--paintlib-button-gap', 6);
    setCssProperty(options.style, 'groupGap', '--paintlib-group-gap', 20);
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
    this.canvasEl = document.createElement('canvas');

    this.canvasContainer = document.createElement('div');
    this.canvasContainer.className = 'paintlib-canvas-container';
    this.canvasContainer.style.marginTop = px(
      this.options.proactivelyShowOptions ? this.options.style.buttonSize : 2 * this.options.style.buttonSize + 10,
    );

    this.element.appendChild(this.canvasContainer);

    this.canvasEl.width = this.canvasContainer.clientWidth;
    this.canvasEl.height = this.canvasContainer.clientHeight;
    this.canvasContainer.appendChild(this.canvasEl);

    this.canvas = new Canvas(this.canvasEl);
    this.canvas.selection = false;
    this.canvas.defaultCursor = 'pointer';
    this.canvas.backgroundColor = '#ffffff';

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

    // 5. Update selected object with option on change
    const updateFactory = (field: string) => {
      return (newValue: any) => {
        if (this.uiStore.getState().activeAction === UIActionType.DRAW) {
          (this.uiStore.getState().allActions[UIActionType.DRAW] as DrawAction).update();
        }
        const activeFabricObj = this.canvas.getActiveObject();
        const activePaintObj = this.objects.find((x) => x['fabricObject'] === activeFabricObj);
        if (activePaintObj) {
          activePaintObj.setOptions({ [field]: newValue });
          this.canvas.renderAll();
        }
      };
    };

    useState(this.uiStore, (store) => store.options.fgColor, updateFactory('stroke'));
    useState(this.uiStore, (store) => store.options.bgColor, updateFactory('fill'));
    useState(this.uiStore, (store) => store.options.tickness, updateFactory('strokeWidth'));
    /*useState(
      this.uiStore,
      (store) => store.globalScale,
      () => {
        if (this.uiStore.getState().activeAction === UIActionType.DRAW) {
          (this.uiStore.getState().allActions[UIActionType.DRAW] as DrawAction).update();
        }
      },
    );*/

    new ResizeObserver(this.fitViewport).observe(this.container);
  }

  /* ************************************ */
  /* ********** LOAD CANVAS ********** */
  /* ************************************ */

  async load(options: PaintlibLoadOptions) {
    // TODO: Why not included in constructor ?
    this.image = await FabricImage.fromURL(options.image, { crossOrigin: 'anonymous' });

    this.image.hasControls = false;
    this.image.selectable = false;
    this.image.lockMovementX = true;
    this.image.lockMovementY = true;
    this.image.moveCursor = 'pointer';
    this.image.hoverCursor = 'pointer';

    // Auto-detect format if possible (else fallback png)
    if (options.format) {
      this.format = options.format;
    } else {
      const ext = getUrlExtension(options.image).toLowerCase();
      if (ext === 'jpg' || ext === 'jped') {
        this.format = 'jpeg';
      } else {
        this.format = 'png';
      }
    }
    // --------------------------------------------------

    const { width, height, scale } = calculateImageScaleToFitViewport(
      { width: this.canvas.width, height: this.canvas.height },
      { width: this.image.width, height: this.image.height },
    );

    this.canvas.setDimensions({ width, height });
    this.image.scale(scale);
    // this.canvas.backgroundImage = this.image;

    this.canvas.add(this.image);
    this.canvas.centerObject(this.image);

    if (options.restoreData) {
      this.restore(JSON.parse(atob(options.restoreData)));
    }

    this.enableSelection(true);
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
    const oldWidth = this.transform.rotation % 180 === 0 ? this.canvas.width : this.canvas.height;
    const containerWidth = this.canvasContainer.clientWidth;
    const containerHeight = this.canvasContainer.clientHeight;

    const {
      width: canvasWidth,
      height: canvasHeight,
      scale: imgScale,
    } = calculateImageScaleToFitViewport(
      { width: containerWidth, height: containerHeight },
      {
        width: rotation % 180 === 0 ? this.image.width : this.image.height,
        height: rotation % 180 === 0 ? this.image.height : this.image.width,
      },
    );

    this.canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
    this.image.scale(imgScale);
    this.image.rotate(rotation);
    this.canvas.centerObject(this.image);

    // 3. Apply new global scale to objects
    const newWidth = rotation % 180 === 0 ? this.canvas.width : this.canvas.height;
    const newScale = newWidth / oldWidth;
    this.setTransformProps({
      scale: this.transform.scale * newScale,
      rotation,
    });
  }

  private fitViewport = () => {
    if (!this.image) {
      return;
    }
    this.canvas.discardActiveObject();

    const containerWidth = this.canvasContainer.clientWidth;
    const containerHeight = this.canvasContainer.clientHeight;

    const oldWidth = this.canvas.width;

    const {
      width: canvasWidth,
      height: canvasHeight,
      scale: imgScale,
    } = calculateImageScaleToFitViewport(
      { width: containerWidth, height: containerHeight },
      {
        width: this.transform.rotation % 180 === 0 ? this.image.width : this.image.height,
        height: this.transform.rotation % 180 === 0 ? this.image.height : this.image.width,
      },
    );

    this.canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
    this.image.scale(imgScale);
    this.canvas.centerObject(this.image);

    const newScale = canvasWidth / oldWidth;
    this.setTransformProps({ scale: this.transform.scale * newScale });
  };

  private setTransformProps(props: Partial<TransformProps>) {
    this.transform = Object.assign(this.transform, props);
    for (const obj of this.objects) {
      obj.update(this.transform);
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
    if (!this.canvas.contains(object['fabricObject'])) {
      // Can be already on canvas in the case of PaintDraw
      this.canvas.add(object['fabricObject']);
    }
    object.update(this.transform);
  }

  remove(object: PaintObject<any>) {
    this.objects = this.objects.filter((x) => x !== object);
    this.canvas.remove(object['fabricObject']);
  }

  /* ************************************ */
  /* ********** SAVE & RESTORE ********** */
  /* ************************************ */

  private restore(data: CanvasSerializedJson) {
    this.format = data.format;
    // TODO
    /*
    if (data.image?.angle) {
      this.rotateImgAndCanvas(data.image?.angle);
    }
    const objScale = this.canvas.width / data.width;
    this.uiStore.setState({ globalScale: data.globalScale * objScale });

    for (const objData of data.objects) {
      const obj = ObjectRegistry.restoreObject(objData);
      this.add(obj);
    }*/
    this.canvas.renderAll();
  }

  getFormat() {
    return this.format;
  }

  getDataURL() {
    let scale = 1;

    if (this.image) {
      scale /= this.image.scaleX;
    }

    return this.canvas.toDataURL({ format: this.format, multiplier: scale });
  }

  serialize(): CanvasSerializedJson {
    return {
      format: this.format,
      width: this.canvas.width,
      height: this.canvas.height,
      transform: this.transform,
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
      x = this.canvas.width;
    } else if (this.transform.rotation === 180) {
      x = this.canvas.width;
      y = this.canvas.height;
    } else if (this.transform.rotation === 270) {
      y = this.canvas.height;
    }

    return new Point(x, y);
  }

  /**
   * Convert real position to canvas position.
   */
  getCanvasPosFromReal(realPos: Point) {
    // TODO: Take global scale into account
    const reference = this.getReferencePoint();
    return realPos.rotate(util.degreesToRadians(this.transform.rotation)).add(reference);
  }

  /**
   * Convert canvas position to real position.
   */
  getRealPositionFromCanvas(canvasPos: Point) {
    // TODO: Take global scale into account
    const reference = this.getReferencePoint();
    return canvasPos.subtract(reference).rotate(-util.degreesToRadians(this.transform.rotation));
  }

  /* ************************************ */
  /* ********** RANDOM GETTERS ********** */
  /* ************************************ */
  getPalette() {
    if (!this.options?.palette) {
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
    return this.options.palette;
  }

  getAvailableTickness() {
    if (!this.options?.tickness) {
      return [1, 2, 3, 5, 10];
    }
    return this.options.tickness;
  }

  getTransform() {
    return { ...this.transform };
  }
}
