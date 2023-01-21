import { setupWebGl } from './gl';

export type Color = [number, number, number];

export class PixelCanvas {
  public render: () => void;
  private pixels: Uint8Array;

  constructor(
    public readonly canvas: HTMLCanvasElement,
    public readonly width = 240,
    public readonly height = 136
  ) {
    const obj = setupWebGl(canvas, width, height);
    this.render = obj.render;
    this.pixels = obj.pixels;
  }

  pget(x: number, y: number): Color {
    return [
      this.pixels[3 * (x + y * this.width) + 0] ?? 0,
      this.pixels[3 * (x + y * this.width) + 1] ?? 0,
      this.pixels[3 * (x + y * this.width) + 2] ?? 0,
    ];
  }

  pset(x: number, y: number, color: Color) {
    this.pixels[3 * (x + y * this.width) + 0] = color[0];
    this.pixels[3 * (x + y * this.width) + 1] = color[1];
    this.pixels[3 * (x + y * this.width) + 2] = color[2];
  }

  clearScreen(color: Color = [200, 12, 123]) {
    for (let j = 0; j < this.height; j++) {
      for (let i = 0; i < this.width; i++) {
        this.pset(i, j, color);
      }
    }
  }
}
