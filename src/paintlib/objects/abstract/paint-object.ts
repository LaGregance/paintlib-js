import { Object as FabricObject, Point, TBBox } from 'fabric';
import { PaintObjectFields } from '../../models/paint-object-fields';
import { PaintObjectJson } from './paint-object-json';

export abstract class PaintObject<T extends FabricObject> {
  protected vector: Point;
  protected fabricObject: T;
  protected fields: Partial<PaintObjectFields> = {};

  attach(obj: T) {
    this.fabricObject = obj;
  }

  /**
   * Create the object at specific position.
   * You should not override this function in subclass (use instantiate instead).
   *
   * @param point
   */
  create(point: Point) {
    this.instantiate(point);
  }

  /**
   * Internal function specific for each subclass to instantiate the object at specific position.
   * `this.object` need to be defined after this function is called.
   *
   * @param point
   * @protected
   */
  abstract instantiate(point: Point): void;

  /**
   * Update the layout of the object, used during creation process & resizing.
   *
   * Note: start & end are useful when object should be oriented (like arrow)
   *
   * @param layout The layout
   * @param start First point of the creation
   * @param end Last point of the creation
   * @protected
   */
  updateLayout(layout: TBBox, start: Point, end: Point) {
    this.vector = end.subtract(start);
  }

  /**
   * Update fields of the underlying fabric object.
   * This method should be overridden to effectively set fields.
   *
   * @param fields
   */
  set(fields: Partial<PaintObjectFields>) {
    this.fields = Object.assign(this.fields, fields);
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

  getStart() {
    const layout = this.getLayout();
    return new Point(layout.left, layout.top);
  }

  getEnd() {
    const layout = this.getLayout();
    return new Point(layout.left + layout.width, layout.top + layout.height);
  }

  /**
   * This function is used to rotate or resize the canvas
   * @param scale
   * @param rotation
   * @param translation
   */
  rotateWithCanvas(scale: number, rotation: number, translation: Point) {
    const start = this.getStart().scalarMultiply(scale).rotate(rotation).add(translation);
    const end = this.getEnd().scalarMultiply(scale).rotate(rotation).add(translation);

    this.updateLayout(
      {
        left: Math.min(start.x, end.x),
        top: Math.min(start.y, end.y),
        width: Math.abs(start.x - end.x),
        height: Math.abs(start.y - end.y),
      },
      start,
      end,
    );
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
    };
  }

  /**
   * Restore the object from a JSON object (obtained from toJSON function)
   * @param data
   */
  restore(data: PaintObjectJson) {}
}
