import { Canvas, FabricImage, FabricObject, Point, util } from 'fabric';
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
import { ObjectRegistry } from './config/object-registry';

export class PaintLib {
  public readonly element: HTMLDivElement;

  public canvas: Canvas;
  public readonly uiStore: StoreApi<UIStore>;

  private canvasEl: HTMLCanvasElement;
  private canvasContainer: HTMLDivElement;
  private image?: FabricImage;
  private format?: 'png' | 'jpeg';
  private objects: PaintObject<any>[] = [];

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
          activePaintObj.set({ [field]: newValue });
          this.canvas.renderAll();
        }
      };
    };

    useState(this.uiStore, (store) => store.options.fgColor, updateFactory('stroke'));
    useState(this.uiStore, (store) => store.options.bgColor, updateFactory('fill'));
    useState(this.uiStore, (store) => store.options.tickness, updateFactory('strokeWidth'));
    useState(
      this.uiStore,
      (store) => store.globalScale,
      () => {
        if (this.uiStore.getState().activeAction === UIActionType.DRAW) {
          (this.uiStore.getState().allActions[UIActionType.DRAW] as DrawAction).update();
        }
      },
    );

    new ResizeObserver(this.fitViewport).observe(this.container);
  }

  async load(options: PaintlibLoadOptions) {
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
    this.canvas.requestRenderAll();
  }

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

  private rotateImgAndCanvas(rotation: number) {
    const containerWidth = this.canvasContainer.clientWidth;
    const containerHeight = this.canvasContainer.clientHeight;

    const actualRotation = this.image.angle;
    const newRotation = actualRotation + rotation;

    const {
      width: imgWidth,
      height: imgHeight,
      scale: imgScale,
    } = calculateImageScaleToFitViewport(
      { width: containerWidth, height: containerHeight },
      {
        width: newRotation % 180 === 0 ? this.image.width : this.image.height,
        height: newRotation % 180 === 0 ? this.image.height : this.image.width,
      },
    );

    this.canvas.setDimensions({ width: imgWidth, height: imgHeight });
    this.image.scale(imgScale);
    this.image.rotate(newRotation);
    this.canvas.centerObject(this.image);
  }

  rotate(direction: 'left' | 'right') {
    this.canvas.discardActiveObject();

    const actualWidth = this.canvas.width;
    this.rotateImgAndCanvas(direction === 'left' ? -90 : 90);
    const newWidth = this.canvas.width;
    const newHeight = this.canvas.height;

    const objRotation = util.degreesToRadians(direction === 'left' ? -90 : 90);
    const objScale = newHeight / actualWidth;
    this.uiStore.setState((old) => ({ globalScale: old.globalScale * objScale }));
    const translation = new Point(direction === 'right' ? newWidth : 0, direction === 'right' ? 0 : newHeight);

    for (const obj of this.objects) {
      obj.applyTransforms(objScale, objRotation, translation);
    }

    this.canvas.renderAll();
  }

  private fitViewport = () => {
    if (!this.image) {
      return;
    }

    const containerWidth = this.canvasContainer.clientWidth;
    const containerHeight = this.canvasContainer.clientHeight;

    const actualWidth = this.canvas.width;
    const actualRotation = this.image.angle;

    this.canvas.discardActiveObject();

    const {
      width: imgWidth,
      height: imgHeight,
      scale: imgScale,
    } = calculateImageScaleToFitViewport(
      { width: containerWidth, height: containerHeight },
      {
        width: actualRotation % 180 === 0 ? this.image.width : this.image.height,
        height: actualRotation % 180 === 0 ? this.image.height : this.image.width,
      },
    );

    this.canvas.setDimensions({ width: imgWidth, height: imgHeight });
    this.image.scale(imgScale);
    this.canvas.centerObject(this.image);

    const objScale = imgWidth / actualWidth;
    this.uiStore.setState((old) => ({ globalScale: old.globalScale * objScale }));

    for (const obj of this.objects) {
      obj.applyTransforms(objScale);
    }

    this.canvas.renderAll();
  };

  getAvailableTickness() {
    if (!this.options?.tickness) {
      return [1, 2, 3, 5, 10];
    }
    return this.options.tickness;
  }

  getSelectedObject() {
    const selected = this.canvas.getActiveObject();
    return this.objects.find((x) => x['fabricObject'] === selected);
  }

  add(object: PaintObject<any>) {
    this.objects.push(object);
    if (!this.canvas.contains(object['fabricObject'])) {
      // Can be already on canvas in the case of PaintDraw
      this.canvas.add(object['fabricObject']);
    }
  }

  remove(object: PaintObject<any>) {
    this.objects = this.objects.filter((x) => x !== object);
    this.canvas.remove(object['fabricObject']);
  }

  private restore(data: CanvasSerializedJson) {
    this.format = data.format;

    if (data.image?.angle) {
      this.rotateImgAndCanvas(data.image?.angle);
    }
    const objScale = this.canvas.width / data.width;
    this.uiStore.setState({ globalScale: data.globalScale * objScale });

    for (const objData of data.objects) {
      const obj = ObjectRegistry.restoreObject(this, objData);
      const fabObj: FabricObject = obj['fabricObject'];
      if (obj && objScale !== 1) {
        fabObj.set({
          top: fabObj.top * objScale,
          left: fabObj.left * objScale,
          scaleX: fabObj.scaleX * objScale,
          scaleY: fabObj.scaleY * objScale,
        });
      }
      fabObj.setCoords();
    }
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
      width: this.canvas.width,
      height: this.canvas.height,
      format: this.format,
      globalScale: this.uiStore.getState().globalScale,
      image: {
        angle: this.image.angle,
      },
      objects: this.objects.map((x) => x.serialize()),
    };
  }
}
