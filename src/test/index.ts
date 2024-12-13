import { PaintActionType, PaintLib } from '../paintlib';
import * as fabric from 'fabric';

export async function init(container: HTMLElement) {
  const paintlib = new PaintLib(container, {
    proactivelyShowOptions: false,
    clearEraseImage: true,
    enableTooltip: true,
    onActionOverride: (action) => {
      if (action === PaintActionType.CLEAR) {
        return false;
      }
      return false;
    },
    // actions: new PaintActionBuilder().basics().objects().save().build(),
  });

  await paintlib.load({
    image: '/assets/original.jpeg',
    imageSizeMode: 'viewport',
    restoreData:
      'eyJ3aWR0aCI6NDYzLjUsImhlaWdodCI6NDYzLjUsInRyYW5zZm9ybSI6eyJyb3RhdGlvbiI6MH0sIm9iamVjdHMiOlt7InR5cGUiOiJQYWludEFycm93IiwibGF5b3V0Ijp7ImxlZnQiOjYuMDMwODk3NjE1Nzk2OTMxLCJ0b3AiOjI3Ny45ODgyODEyNSwid2lkdGgiOjIwMi45OTA3MjI2NTYyNSwiaGVpZ2h0IjoxNTAuOTk2MDkzNzV9LCJ2ZWN0b3IiOnsieCI6MSwieSI6MX0sIm9wdGlvbnMiOnsidGlja25lc3MiOjEwLCJmZ0NvbG9yIjoiI0ZGMDAwMCIsImJnQ29sb3IiOiJ0cmFuc3BhcmVudCJ9LCJ0cmFuc2Zvcm0iOnsic2NhbGVYIjoxLCJzY2FsZVkiOjEsInJvdGF0aW9uIjowfX0seyJ0eXBlIjoiUGFpbnRUZXh0IiwibGF5b3V0Ijp7ImxlZnQiOjY2LjY3Nzk5MzUyNzUwODEsInRvcCI6NDY0LCJ3aWR0aCI6MzQ4LjAzNjUwNDQyNDc3ODgsImhlaWdodCI6MTIwfSwidmVjdG9yIjp7IngiOjEsInkiOjF9LCJvcHRpb25zIjp7InRpY2tuZXNzIjoxMCwiZmdDb2xvciI6IiNGRjAwMDAiLCJiZ0NvbG9yIjoidHJhbnNwYXJlbnQifSwidHJhbnNmb3JtIjp7InNjYWxlWCI6MSwic2NhbGVZIjoxLCJyb3RhdGlvbiI6MH0sImV4dHJhcyI6eyJmb250U2l6ZSI6MTA2LjE5NDY5MDI2NTQ4Njc0LCJ0ZXh0IjoiQWx0aXR1ZGUifX1dfQ==',
    onSave: () => {
      console.log(paintlib.saveState());
    },
  });
  (window as any).paintlib = paintlib;
  (window as any).fabric = fabric;
}

const container = document.getElementById('root');
if (container) {
  init(container);
}
