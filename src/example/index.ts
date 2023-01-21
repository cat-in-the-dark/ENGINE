import {PixelCanvas} from '../lib/render/canvas';

function ready(fn: () => void) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(main);

function main() {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    throw new Error('Canvas not found');
  }
  const app = new PixelCanvas(canvas, 240, 136);
  const color: [number, number, number] = [0, 0, 0];

  const loop = () => {
    app.clearScreen(color);
    app.render();
    color[0] += 0.25;
    color[1] += 0.5;
    color[2] += 0.75;

    window.requestAnimationFrame(loop);
  };

  loop();
}
