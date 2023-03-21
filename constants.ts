export const [height, width, dx, dy] = [480, 800, 40, 40];
export const [minx, maxx, miny, maxy] = [0, width / dx, 0, height / dy];
export const DOFFSETS = [
  [-1, 1],
  [1, 1],
  [1, -1],
  [-1, -1],
];
export const COFFSETS = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

export const ALLOFFSETS = [...DOFFSETS, ...COFFSETS];
