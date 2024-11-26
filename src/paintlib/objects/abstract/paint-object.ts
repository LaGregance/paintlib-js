import { Object as FabricObject, Point, TBBox, util } from 'fabric';
import { PaintObjectFields } from '../../models/paint-object-fields';
import { PaintObjectJson } from '../../models/paint-object-json';
import { ObjectRegistry } from '../../config/object-registry';

export abstract class PaintObject<T extends FabricObject> {
  protected vector: Point;
  protected fabricObject: T;
  protected fields: Partial<PaintObjectFields> = {};

  /**
   * Create the object at specific position.
   * You should not override this function in subclass (use instantiate instead).
   *
   * @param point
   * @param restoreData
   */
  create(point: Point, restoreData?: PaintObjectJson) {
    this.instantiate(point, restoreData);
  }

  /**
   * Internal function specific for each subclass to instantiate the object at specific position.
   * `this.object` need to be defined after this function is called.
   *
   * @param point
   * @param restoreData
   * @protected
   */
  abstract instantiate(point: Point, restoreData?: PaintObjectJson): void;

  /**
   * Update the layout of the object, used during creation process & resizing.
   *
   * Note: start & end are useful when object should be oriented (like arrow)
   *
   * @param layout The layout
   * @param vector The vector that represent the direction of the object
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
  }

  /**
   * Called once the creation process using editor is finish
   */
  onCreated(): void {}

  /**
   * Update fields of the underlying fabric object.
   * This method should be overridden to effectively set fields.
   *
   * @param fields
   */
  set(fields: Partial<PaintObjectFields>) {
    this.fields = Object.assign(this.fields, fields);
  }

  get() {
    return this.fields;
  }

  /**
   * Return true if the current object is valid for creation.
   * In general it should return false when the object is too small.
   */
  isValidForCreation(): boolean {
    return this.fabricObject.width > 2 && this.fabricObject.height > 2;
  }

  getLayout(): TBBox {
    return {
      top: this.fabricObject.top,
      left: this.fabricObject.left,
      width: this.fabricObject.width,
      height: this.fabricObject.height,
    };
  }

  /**
   * A vector indicate the direction of the inner object, each component can be either -1 or 1
   */
  getVector() {
    return this.vector.clone();
  }

  /**
   * This function is used to rotate or resize the canvas.
   *
   * @param scale
   * @param rotation
   * @param translation
   */
  applyTransforms(scale: number, rotation?: number, translation?: Point) {
    let start = new Point(this.fabricObject.left, this.fabricObject.top);

    if (scale !== 1) {
      start = start.scalarMultiply(scale);
    }
    if (rotation) {
      start = start.rotate(rotation);
    }
    if (translation) {
      start = start.add(translation);
    }

    this.fabricObject.set({
      angle: this.fabricObject.angle + util.radiansToDegrees(rotation || 0),
      scaleX: this.fabricObject.scaleX * scale,
      scaleY: this.fabricObject.scaleY * scale,
      left: start.x,
      top: start.y,
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
   * Override this function to restore extras
   */
  restoreExtras(_data: PaintObjectJson): any {
    return undefined;
  }

  /**
   * Serialize the object in order to restore it later.
   */
  serialize(): PaintObjectJson {
    return {
      type: this.constructor.name,
      layout: this.getLayout(),
      vector: this.vector,
      angle: this.fabricObject.angle,
      scaleX: this.fabricObject.scaleX,
      scaleY: this.fabricObject.scaleY,
      fields: this.fields,
      extras: this.serializeExtras(),
    };
  }

  /**
   * Restore the object from a JSON object (obtained from serialize function)
   * @param data
   */
  restoreObject(data: PaintObjectJson) {
    this.create(new Point(data.layout.left, data.layout.top), data);
    this.vector = new Point(data.vector.x, data.vector.y);
    this.set(data.fields);
    this.fabricObject.set({
      angle: data.angle,
      scaleX: data.scaleX,
      scaleY: data.scaleY,
    });
    this.restoreExtras(data);

    const meta = ObjectRegistry.getObjectMeta(data.type);
    if (!meta.avoidLayoutOnRestore) {
      this.updateLayout(data.layout, this.vector);
    }
  }
}
