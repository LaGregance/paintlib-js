import { Object, Point, TBBox } from 'fabric';
import { PaintObjectFields } from '../models/paint-object-fields';

export abstract class PaintObject<T extends Object> {
  protected fabricObject: T;

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
  abstract updateLayout(layout: TBBox, start: Point, end: Point): void;

  /**
   * Update fields of the underlying fabric object.
   * You can override this function in subclass to customize the behavior.
   *
   * @param fields
   */
  set(fields: Partial<PaintObjectFields>) {
    this.fabricObject.set(fields);
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
      width: this.fabricObject.width + this.fabricObject.strokeWidth,
      height: this.fabricObject.height + this.fabricObject.strokeWidth,
    };
  }

  /**
   * Serialize the object in order to restore it later.
   */
  abstract toJSON(): any;

  /**
   * Restore the object from a JSON object (obtained from toJSON function)
   * @param data
   */
  abstract restore(data: any): void;
}
