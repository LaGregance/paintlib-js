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
      'eyJ3aWR0aCI6NDI2LCJoZWlnaHQiOjU2OCwidHJhbnNmb3JtIjp7InJvdGF0aW9uIjowfSwib2JqZWN0cyI6W3sidHlwZSI6IlBhaW50VGV4dCIsImxheW91dCI6eyJsZWZ0Ijo3MS40MDA4MjkyOTUwNzUzNCwidG9wIjo0MDIuMDk5MTcwNzA0OTI0NzUsIndpZHRoIjo0MjkuMjQ1MDIyMTIzODkzOCwiaGVpZ2h0IjoxNDh9LCJ2ZWN0b3IiOnsieCI6MSwieSI6MX0sIm9wdGlvbnMiOnsidGlja25lc3MiOjEwLCJmZ0NvbG9yIjoiI0ZGMDAwMCIsImJnQ29sb3IiOiJ0cmFuc3BhcmVudCJ9LCJ0cmFuc2Zvcm0iOnsic2NhbGVYIjowLjczNzU4OTQ1ODM1NjIxMDEsInNjYWxlWSI6MC43Mzc1ODk0NTgzNTYyMTAxLCJyb3RhdGlvbiI6MH0sImV4dHJhcyI6eyJmb250U2l6ZSI6MTMwLjk3MzQ1MTMyNzQzMzYyLCJ0ZXh0IjoiQWx0aXR1ZGUifX0seyJ0eXBlIjoiUGFpbnRSZWN0IiwibGF5b3V0Ijp7ImxlZnQiOjYxLjUsInRvcCI6NDA5LCJ3aWR0aCI6MzM2LCJoZWlnaHQiOjg5fSwidmVjdG9yIjp7IngiOjEsInkiOi0xfSwib3B0aW9ucyI6eyJ0aWNrbmVzcyI6MTAsImZnQ29sb3IiOiIjRkZBNTAwIiwiYmdDb2xvciI6InRyYW5zcGFyZW50In0sInRyYW5zZm9ybSI6eyJzY2FsZVgiOjEsInNjYWxlWSI6MSwicm90YXRpb24iOjB9fSx7InR5cGUiOiJQYWludEFycm93IiwibGF5b3V0Ijp7ImxlZnQiOjc0LjUsInRvcCI6MjMzLCJ3aWR0aCI6MzE5LCJoZWlnaHQiOjE3Nn0sInZlY3RvciI6eyJ4IjoxLCJ5IjoxfSwib3B0aW9ucyI6eyJ0aWNrbmVzcyI6MTAsImZnQ29sb3IiOiIjNDE2OUUxIiwiYmdDb2xvciI6InRyYW5zcGFyZW50In0sInRyYW5zZm9ybSI6eyJzY2FsZVgiOjEsInNjYWxlWSI6MSwicm90YXRpb24iOjB9fV19',
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
