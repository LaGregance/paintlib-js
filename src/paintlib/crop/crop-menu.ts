import CancelSVG from '../svgs/cancel.svg';
import SaveSVG from '../svgs/save.svg';
import FullSVG from '../svgs/crop-full.svg';
import { Component } from '../components/component';
import { View } from '../components/view';
import { ActionGroup } from '../components/action-group';
import { IconButton } from '../components/buttons/icon-button';
import { PaintLib } from '../paintlib';
import { CropFeature } from './crop-feature';
import { TBBox } from 'fabric';

export class CropMenu extends Component<'div'> {
  private cropFeature: CropFeature;
  private originalCrop: TBBox;

  constructor(
    private paintlib: PaintLib,
    public cleanup: () => any,
  ) {
    super('div');
    this.cropFeature = paintlib['cropFeature'];
    this.originalCrop = this.cropFeature['originalCrop'];
  }

  init() {
    this.element.className = 'paintlib-menu';
    this.element.style.zIndex = '2000';

    const actionsView = new View('paintlib-menu-line');
    actionsView.element.style.justifyContent = 'center';

    const full = new IconButton(() => {
      this.cropFeature.full();
    }, FullSVG);

    const cancel = new IconButton(() => {
      this.cleanup();

      this.cropFeature.cancel();
      this.paintlib.cropImage(this.originalCrop);
      this.paintlib.discardLastCheckpoint();
    }, CancelSVG);

    const save = new IconButton(() => {
      this.paintlib.saveCropFromFeature();
    }, SaveSVG);

    actionsView.add(new ActionGroup([full]));
    actionsView.add(new ActionGroup([cancel, save]));
    this.add(actionsView);
  }
}
