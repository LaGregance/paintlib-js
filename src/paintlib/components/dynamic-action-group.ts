import { ActionGroup } from './action-group';
import { ShowMoreActionButton } from './buttons/show-more-action-button';
import MoreMenuSVG from '../svgs/more-menu.svg';
import { ActionButton } from './buttons/action-button';

export class DynamicActionGroup extends ActionGroup {
  constructor(factory: () => ActionButton[]) {
    super([...factory(), new ShowMoreActionButton(factory(), MoreMenuSVG)]);
  }

  init() {
    super.init();

    const container = document.querySelector('.paintlib-root');

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
    }).observe(container);
  }
}
