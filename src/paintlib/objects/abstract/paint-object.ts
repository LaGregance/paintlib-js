import { Object as FabricObject, Point, TBBox } from 'fabric';
import { PaintObjectOptions } from '../../models/paint-object-options';
import { PaintObjectJson } from '../../models/paint-object-json';
import { PaintObjectTransformProps } from '../../models/global-transform-props';
import { PaintLib } from '../../paintlib';
import { PaintObjectCheckpoint } from '../../models/checkpoint';
import { PaintObjectClass } from '../../config/object-registry';

export abstract class PaintObject<T extends FabricObject> {
  protected layout: TBBox;
  protected vector: Point;
  protected options: Partial<PaintObjectOptions> = {};
  protected transform: PaintObjectTransformProps = { scaleX: 1, scaleY: 1, rotation: 0 };

  protected fabricObject: T;

  /**
   * Called when the object is binded to paintlib, just before it was added to the canvas
   *
   * @param paintLib
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bind(paintLib: PaintLib) {}

  /**
   * Called once the creation process using editor is finish
   */
  onCreated() {}

  /**
   * Internal function specific for each subclass to instantiate the object at specific position.
   * `this.object` need to be defined after this function is called.
   *
   * @param point
   * @param restoreData
   * @protected
   */
  protected abstract instantiate(point: Point, restoreData?: PaintObjectJson): void;

  /**
   * Custom function that render the object with layout/vector/options.
   * It doesn't apply transform to the object.
   */
  protected abstract render(): void;

  /**
   * Create the object at specific position.
   * You should not override this function in subclass (use instantiate instead).
   *
   * @param point
   * @param extras
   */
  create(point: Point, extras?: any) {
    this.instantiate(point, extras);
  }

  /**
   * Update the layout of the object, used during creation process & resizing.
   *
   * @param layout The layout
   * @param vector The vector that represent the direction of the inner object
   * @protected
   */
  updateLayout(layout: TBBox, vector?: Point) {
    if (!vector) {
      vector = new Point(1, 1);
    } else {
      if (vector.x === 0) {
        vector.x = 1;
      }
      if (vector.y === 0) {
        vector.y = 1;
      }
    }
    this.vector = vector.divide(new Point(Math.abs(vector.x), Math.abs(vector.y)));
    this.layout = layout;
  }

  /**
   * Return the layout of the object, this doesn't take any transform into account.
   */
  getLayout(): TBBox {
    return { ...this.layout };
  }

  /**
   * A vector indicate the direction of the inner object, each component can be either -1 or 1
   */
  getVector() {
    return this.vector.clone();
  }

  /**
   * Update options of the object. You need to call `update` to effectively render these changes.
   *
   * @param fields
   */
  setOptions(fields: Partial<PaintObjectOptions>) {
    this.options = Object.assign(this.options, fields);
  }

  /**
   * Return the options of the object
   */
  getOptions() {
    return { ...this.options };
  }

  /**
   * Set transform properties of the object. You need to call `update` to effectively render these changes.
   *
   * @param props
   */
  setTransform(props: Partial<PaintObjectTransformProps>) {
    this.transform = Object.assign(this.transform, props);
  }

  /**
   * Return the transform of the object
   */
  getTransform() {
    return { ...this.transform };
  }

  /**
   * Return true if the current object is valid for creation.
   * In general it should return false when the object is too small.
   */
  isValidForCreation() {
    return this.layout.width > 2 && this.layout.height > 2;
  }

  /**
   * Update object render considering global transform. It's also responsible to update position.
   *
   * @param paintlib
   */
  update(paintlib: PaintLib) {
    this.render();
    const globalTransform = paintlib.getTransform();
    const pos = paintlib.getCanvasPosFromReal(new Point(this.layout.left, this.layout.top));

    this.fabricObject.set({
      left: pos.x,
      top: pos.y,
      scaleX: globalTransform.scale * Math.abs(this.transform.scaleX),
      scaleY: globalTransform.scale * Math.abs(this.transform.scaleY),
      flipX: this.transform.scaleX < 0,
      flipY: this.transform.scaleY < 0,
      angle: globalTransform.rotation + this.transform.rotation,
    });
    this.fabricObject.setCoords();
  }

  /**
   * Override this function to add extras during serialization process
   */
  serializeExtras(): any {
    return undefined;
  }

  /**
   * Override this function to add extras during serialization process
   */
  restoreExtras(_extras: any): void {}

  /**
   * Serialize the object in order to restore it later.
   */
  serialize(): PaintObjectJson {
    return {
      type: (this.constructor as PaintObjectClass).getName(),
      layout: this.layout,
      vector: this.vector,
      options: this.options,
      transform: this.transform,
      extras: this.serializeExtras(),
    };
  }

  /**
   * Restore the object from a JSON object (obtained from serialize function)
   * @param data
   */
  restore(data: PaintObjectJson) {
    this.create(new Point(data.layout.left, data.layout.top), data.extras);
    this.setOptions({ ...data.options });
    this.setTransform({ ...data.transform });
    this.restoreExtras(data.extras);
    this.updateLayout({ ...data.layout });
  }

  saveCheckpoint(): PaintObjectCheckpoint {
    return {
      object: this,
      layout: { ...this.layout },
      vector: this.vector.clone(),
      options: { ...this.options },
      transform: { ...this.transform },
      extras: this.serializeExtras(),
    };
  }
}
