import { Canvas, FabricImage, Point, util } from 'fabric';
import { calculateImageScaleToFitViewport } from './utils/size-utils';
import { MainMenu } from './components/main-menu';
import { createUIStore, UIStore } from './store/ui-store';
import { StoreApi } from 'zustand/vanilla';
import { PaintLibOptions } from './paintlib-options';
import { useState } from './utils/use-state';
import { DrawAction } from './actions/draw-action';
import { PaintObject } from './objects/abstract/paint-object';
import { UIActionType } from './config/ui-action-type';
import { setCssProperty, px } from './utils/utils';

export class PaintLib {
  public readonly element: HTMLDivElement;

  public canvas: Canvas;
  public readonly uiStore: StoreApi<UIStore>;

  private canvasEl: HTMLCanvasElement;
  private canvasContainer: HTMLDivElement;
  private image?: FabricImage;
  private objects: PaintObject<any>[] = [];

  constructor(
    public readonly container: HTMLElement,
    public readonly options: PaintLibOptions = {},
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
    this.init();
  }

  init() {
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
    mainMenu.setupEvent();

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

    new ResizeObserver(this.fitViewport).observe(this.container);
  }

  async loadImage() {
    this.image = await FabricImage.fromURL('http://localhost:8080/assets/dummy_hz.jpeg', { crossOrigin: 'anonymous' });
    /*this.image = await FabricImage.fromURL(
      'data:image/png;base64,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',
    );*/
    this.image.hasControls = false;
    this.image.selectable = false;
    this.image.lockMovementX = true;
    this.image.lockMovementY = true;
    this.image.moveCursor = 'pointer';
    this.image.hoverCursor = 'pointer';

    const { width, height, scale } = calculateImageScaleToFitViewport(
      { width: this.canvas.width, height: this.canvas.height },
      { width: this.image.width, height: this.image.height },
    );

    this.canvas.setDimensions({ width, height });
    this.image.scale(scale);
    // this.canvas.backgroundImage = this.image;

    this.canvas.add(this.image);
    this.canvas.centerObject(this.image);
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

    if (enable) {
      this.canvas.discardActiveObject();
    }
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

  rotate(direction: 'left' | 'right') {
    const containerWidth = this.canvasContainer.clientWidth;
    const containerHeight = this.canvasContainer.clientHeight;

    const actualRotation = this.image.angle;
    const actualWidth = this.canvas.width;
    const newRotation = actualRotation + (direction === 'left' ? -90 : 90);

    this.canvas.discardActiveObject();

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

    const objRotation = util.degreesToRadians(direction === 'left' ? -90 : 90);
    const objScale = imgHeight / actualWidth;
    const translation = new Point(direction === 'right' ? imgWidth : 0, direction === 'right' ? 0 : imgHeight);

    for (const obj of this.objects) {
      obj.rotateWithCanvas(objScale, objRotation, translation);
    }

    this.canvas.renderAll();
  }

  fitViewport = () => {
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

    for (const obj of this.objects) {
      obj.rotateWithCanvas(objScale, 0, new Point(0, 0));
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
      this.canvas.add(object['fabricObject']);
    }
  }

  remove(object: PaintObject<any>) {
    this.objects = this.objects.filter((x) => x !== object);
    this.canvas.remove(object['fabricObject']);
  }

  getDataURL() {
    // TODO: Format should depends of initial format
    return this.canvas.toDataURL({ format: 'jpeg', multiplier: 1 });
  }

  toJSON() {
    const data = this.canvas.toJSON();
    if (data.objects) {
      data.objects = data.objects.filter((x: any) => x.type !== 'Image');
    }
    return data;
  }
}
