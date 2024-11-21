import { Component } from '../component';
import { PaintLib } from '../../paintlib';
import { ActionButton } from '../buttons/action-button';
import { CreateObjectAction } from '../../actions/create-object-action';
import { UIActionType } from '../../actions/abstract/base-action';
import { PaintRect } from '../../objects/paint-rect';
import RectangleSVG from '../../svgs/rectangle.svg';
import { PaintEllipse } from '../../objects/paint-ellipse';
import EllipseSVG from '../../svgs/ellipse.svg';
import { PaintArrow } from '../../objects/paint-arrow';
import ArrowSVG from '../../svgs/arrow.svg';
import { PaintLine } from '../../objects/paint-line';
import LineSVG from '../../svgs/line.svg';
import { PaintText } from '../../objects/paint-text';
import TextSVG from '../../svgs/text.svg';
import { DrawAction } from '../../actions/draw-action';
import DrawSVG from '../../svgs/draw.svg';
import { ShowMoreActionButton } from './show-more-action-button';
import { ActionGroup } from '../action-group';

/**
 * This component is responsible to manage the middle part of the menu (object part).
 * His role is to adapt the menu regarding of the width of the container and add "..." extension if relevant.
 */
export class CreateObjectMenuGroup extends Component<'div'> {
  private availableAction = [UIActionType.RECT, UIActionType.ELLIPSE, UIActionType.ARROW, UIActionType.LINE, UIActionType.TEXT, UIActionType.DRAW];
  private moreBtn: ShowMoreActionButton;

  constructor(private paintlib: PaintLib) {
    super('div');
  }

  private createObjectBtn(type: UIActionType, targetMore = false) {
    const onClick = targetMore
      ? () => {
          this.moreBtn?.hideMenu();
        }
      : undefined;

    if (type === UIActionType.RECT) {
      return new ActionButton(this.paintlib, () => new CreateObjectAction(this.paintlib, UIActionType.RECT, PaintRect), RectangleSVG, onClick);
    } else if (type === UIActionType.ELLIPSE) {
      return new ActionButton(this.paintlib, () => new CreateObjectAction(this.paintlib, UIActionType.ELLIPSE, PaintEllipse), EllipseSVG, onClick);
    } else if (type === UIActionType.ARROW) {
      return new ActionButton(this.paintlib, () => new CreateObjectAction(this.paintlib, UIActionType.ARROW, PaintArrow), ArrowSVG, onClick);
    } else if (type === UIActionType.LINE) {
      return new ActionButton(this.paintlib, () => new CreateObjectAction(this.paintlib, UIActionType.LINE, PaintLine), LineSVG, onClick);
    } else if (type === UIActionType.TEXT) {
      return new ActionButton(this.paintlib, () => new CreateObjectAction(this.paintlib, UIActionType.TEXT, PaintText), TextSVG, onClick);
    } else if (type === UIActionType.DRAW) {
      return new ActionButton(this.paintlib, () => new DrawAction(this.paintlib), DrawSVG, onClick);
    } else {
      throw new Error(`Unknown type ${type}`);
    }
  }

  init() {
    this.element.className = 'paintlib-menu-group';

    for (const action of this.availableAction) {
      this.add(this.createObjectBtn(action));
    }

    this.moreBtn = new ShowMoreActionButton((menu) => {
      menu.add(new ActionGroup(this.availableAction.map((action) => this.createObjectBtn(action, true))));
    });
    this.add(this.moreBtn);

    /*const container = document.querySelector('.paintlib-root');

    const ITEM_WIDTH = 40;
    const ITEM_GAP = 6;
    const MIN_WIDTH = 580; // TODO: SHOULD BE DYNAMIC (related to item width in css)

    new ResizeObserver(() => {
      if (container.clientWidth < MIN_WIDTH) {
        // Reduced mode
        const countBtn = this.buttons.length - 1; // Exclude more btn
        const availableWidth = container.clientWidth - (MIN_WIDTH - countBtn * (ITEM_WIDTH + ITEM_GAP));
        const availableBtnCount = Math.max(Math.trunc(availableWidth / (ITEM_WIDTH + ITEM_GAP)), 2) - 1; // Reserve place for more btn
        let countShownBtn = 0;

        for (const btn of this.buttons) {
          if (btn instanceof ShowMoreActionButton) {
            btn.setVisible(true);
          } else if (countShownBtn < availableBtnCount) {
            countShownBtn++;
            btn.setVisible(true);
          } else {
            btn.setVisible(false);
          }
        }
      } else {
        // Regular mode
        for (const btn of this.buttons) {
          btn.setVisible(!(btn instanceof ShowMoreActionButton));
        }
      }
    }).observe(container);*/
  }
}
