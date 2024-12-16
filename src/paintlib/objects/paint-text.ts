import { Point, Textbox } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { PaintLib } from '../paintlib';
import { improveDefaultControl } from '../utils/improve-default-control';

export class PaintText extends PaintObject<Textbox> {
  public static getName() {
    return 'PaintText';
  }

  instantiate(point: Point, extras?: any) {
    this.fabricObject = new Textbox(extras?.text || 'Text', {
      top: point.y,
      left: point.x,
      objectCaching: false,
      fontSize: extras?.fontSize ?? 5,
      fontFamily: 'Times New Roman',
    });

    this.fabricObject.editable = true;
    improveDefaultControl(this.fabricObject.controls);
  }

  restoreExtras(extras: any): void {
    if (extras?.text) {
      this.fabricObject.text = extras.text;
    }
  }

  bind(paintlib: PaintLib) {
    let enterText: string = undefined;
    this.fabricObject.on('editing:entered', () => {
      enterText = this.fabricObject.text;
      paintlib.saveCheckpoint(this);
    });

    this.fabricObject.on('editing:exited', () => {
      if (this.fabricObject.text.length <= 0) {
        paintlib.remove(this);
      } else {
        if (enterText === this.fabricObject.text) {
          paintlib.discardLastCheckpoint();
        } else {
          this.updateLayout({
            left: this.layout.left,
            top: this.layout.top,
            width: this.fabricObject.width,
            height: this.fabricObject.height,
          });
          this.update(paintlib);
        }
      }
    });
  }

  render() {
    this.fabricObject.set({
      top: this.layout.top,
      left: this.layout.left,
      height: this.layout.height,
      width: this.layout.width,
      fill: this.options.fgColor,
    });

    // Adjust fontSize to fit precise height
    const ratio = this.layout.height / this.fabricObject.calcTextHeight();
    if (!ratio || !Number.isFinite(ratio) || Number.isNaN(ratio)) {
      // Avoid divide by 0 and operation with NaN or Infinity
      return;
    }

    this.fabricObject.set({
      fontSize: this.fabricObject.fontSize * ratio,
      height: this.layout.height,
      width: this.layout.width,
    });

    if (this.layout.width < this.fabricObject.width) {
      this.layout.width = this.fabricObject.width;
    }
  }

  onCreated() {
    this.fabricObject.enterEditing();
    this.fabricObject.selectAll();
  }

  serializeExtras(): any {
    return {
      fontSize: this.fabricObject.fontSize,
      text: this.fabricObject.text,
    };
  }
}
