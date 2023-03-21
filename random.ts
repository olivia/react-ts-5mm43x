import {
  height,
  width,
  dx,
  dy,
  maxx,
  maxy,
  minx,
  miny,
  ALLOFFSETS,
  DOFFSETS,
} from './constants';
import { canInsert, idxToXY, xyToIdx } from './line-utils';

const randIdx = () =>
  Math.round(Math.random() * (-1 + (height * width) / (dx * dy)));

export const randomUniqArr = (n, shapeNum, randGen) => {
  const res = [];
  let maxiters = 100;
  let links = [];
  let r, pivotPoint;
  while (n && maxiters >= 0) {
    try {
      const [nr, _, npivotPoint] = randGen(r, res, links);
      res.push(nr);

      n--;
      r = nr;
      pivotPoint = npivotPoint;

      if (pivotPoint !== undefined) {
        links.push([pivotPoint, r]);
      }
    } catch (e) {
      console.log('results', res.length, shapeNum);
      console.error(e, res.length, shapeNum);

      console.log('popping');
      res.pop();
      if (res.length % shapeNum != 0) {
        console.log('pop goes the link');
        links.pop();
      }
      console.log('bla', res.length, links.length);
      n++;
      maxiters--;
    }
  }
  if (maxiters < 0) {
    console.log('exhausted rand function');
  }
  console.log('blaa', res.length, links.length);
  return res;
};

const getOffset = (dir) => {
  const diagonalOffsets = [
    [-1, 1],
    [1, 1],
    [1, -1],
    [-1, -1],
  ];
  const cardinalOffsets = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];
  return diagonalOffsets.concat(cardinalOffsets)[dir];
};

const offsetPivotPoint = (pivotPoint, dir, magnitude) => {
  const oldXY = idxToXY(pivotPoint);
  const offset = [dir[0] * magnitude, dir[1] * magnitude];
  let newXY = [
    Math.min(maxx - 1, Math.max(minx, oldXY[0] + offset[0])),
    Math.min(maxy - 1, Math.max(miny, oldXY[1] + offset[1])),
  ];

  if (DOFFSETS.indexOf(dir) >= 0) {
    const maxMagnitude = Math.min(
      Math.abs(newXY[0] - oldXY[0]),
      Math.abs(newXY[1] - oldXY[1])
    );
    newXY = [
      oldXY[0] + (maxMagnitude * offset[0]) / Math.abs(offset[0]),
      oldXY[1] + (maxMagnitude * offset[1]) / Math.abs(offset[1]),
    ];
  }
  return xyToIdx(newXY as [number, number]);
};

const chooseOffset = (skipList) => {
  const nonskippedOffset = ALLOFFSETS.filter(
    (_, i) => skipList.indexOf(i) === -1
  );

  return nonskippedOffset[
    Math.round(Math.random() * (nonskippedOffset.length - 1))
  ];
};

export const randomWalk = ({ pivotPoint, magnitude, skipList = [] }) => {
  const offset = chooseOffset(skipList);
  const perturbedPoint = offsetPivotPoint(pivotPoint, offset, magnitude);
  return [ALLOFFSETS.indexOf(offset), [pivotPoint, perturbedPoint]] as const;
};

export const randomPathFnCreator = ({ shapeNum, maxStep, dhRatio }) => {
  const fn = (prev, prevPoints, links) => {
    let iterations = 0;
    let skipList = [];
    const pivotPoint = prevPoints[prevPoints.length - 1];

    while (iterations <= 100) {
      if (prev === undefined || prevPoints.length % shapeNum === 0) {
        const r = randIdx();
        if (prevPoints.indexOf(r) >= 0) {
          continue;
        }

        return [r, links];
      } else {
        let offsetAttempt, newLine;
        let magnitude = maxStep;
        while (magnitude > 0) {
          [offsetAttempt, newLine] = randomWalk({
            pivotPoint,
            magnitude,
            skipList,
          });

          if (
            prevPoints.indexOf(newLine[1]) == -1 &&
            canInsert(newLine, prevPoints, shapeNum, links)
          ) {
            return [newLine[1], links, pivotPoint];
          } else {
            magnitude = Math.floor(magnitude - 2);
          }
        }

        if (skipList.length === 7) {
          skipList = [];
        } else {
          skipList.push(offsetAttempt);
        }

        iterations++;
      }
      throw new Error('Exhausted iterations');
    }
  };

  return fn;
};
