import * as React from 'react';
import './style.css';

const [height, width, dx, dy] = [480, 800, 40, 40];
const [minx, maxx, miny, maxy] = [0, width / dx, 0, height / dy];

const randIdx = () =>
  Math.round(Math.random() * (-1 + (height * width) / (dx * dy)));

const idxToXY = (idx) => {
  const cols = width / dx;
  return [idx % cols, Math.floor(idx / cols)];
};

const xyToIdx = ([x, y]) => {
  const cols = width / dx;
  return y * cols + x;
};

const xyToCart = ([x, y]) => {
  return [(x + 0.5) * dx, (y + 0.5) * dy];
};

const randomUniqArr = (n, shapeNum, randGen) => {
  const res = [];
  let maxiters = 100;
  let links = [];
  let r, pivotPoint;
  while (n && maxiters >= 0) {
    try {
      [r, links, pivotPoint] = randGen(res[res.length - 1], res, links);
      console.log('bla', pivotPoint, r, res);
      if (res.indexOf(r) === -1) {
        res.push(r);
        console.log('res is', res);
        n--;

        if (pivotPoint !== undefined) {
          links.push([pivotPoint, r]);
        }
      } else {
        throw new Error('dupe found ' + r);
      }
    } catch (e) {
      console.log('results', res.length, shapeNum);
      console.error(e, res.length, shapeNum);

      if (res.length % shapeNum != 0) {
        console.log('pop goes the link');
        links.pop();
      }
      res.pop();

      n++;
      maxiters--;
    }
  }
  if (maxiters < 0) {
    console.log('exhausted rand function');
  }
  return res;
};

const ShapePath = (props) => {
  return (
    <polyline
      points={props.points.map((p) => `${p[0]},${p[1]}`).join(' ')}
      fill="none"
      stroke={props.color}
    />
  );
};

const getLinkDir = ([l1s, l1e]) => {
  const [diffx, diffy] = [l1e[0] - l1s[0], l1e[1], l1s[1]];
  
};

const pointIsOnLine = (p, [l1s, l1e]) => {
  const [[px, py], [x1, y1], [x2, y2]] = [p, l1s, l1e].map(idxToXY);

  if (x1 === x2) {
    // vertical
    return px === x1 && Math.min(y1, y2) <= py && py <= Math.max(y1, y2);
  } else if (y1 === y2) {
    // horizontal
    return py === y1 && Math.min(x1, x2) <= px && px <= Math.max(x1, x2);
  } else {
    const t1 = (px - x1) / (x2 - x1);
    const t2 = (py - y1) / (y2 - y1);
    return t1 === t2 && t1 <= 1 && 0 <= t1;
  }
};

const lineIdxIntersects = ([l1s, l1e], [l2s, l2e]) => {
  const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = [l1s, l1e, l2s, l2e].map(
    idxToXY
  );
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  // parallel or coincident
  if (denominator === 0) {
    //console.log(denominator);
    return pointIsOnLine(l2s, [l1s, l1e]) || pointIsOnLine(l2e, [l1s, l1e]);
  }
  const px =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
    denominator;
  const py =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
    denominator;
  //console.log('intersection point is', px, py, denominator);
  return (
    Math.min(x1, x2) <= px &&
    Math.max(x1, x2) >= px &&
    Math.min(y1, y2) <= py &&
    Math.max(y1, y2) >= py &&
    Math.min(x3, x4) <= px &&
    Math.max(x3, x4) >= px &&
    Math.min(y3, y4) <= py &&
    Math.max(y3, y4) >= py
  );
};

const prettyPrint = ([l1s, l1e], [l2s, l2e]) => {
  return [l1s, l1e, l2s, l2e].map(idxToXY);
};

const isParallel = ([l1s, l1e], [l2s, l2e]) => {
  const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = [l1s, l1e, l2s, l2e].map(
    idxToXY
  );
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  return denominator === 0;
};
const pDir = ['NW', 'NE', 'SE', 'SW', 'N', 'E', 'S', 'W'];

const randomWalk = ({ pivotPoint, maxStep, dhRatio, skipList = [] }) => {
  const [magnitude] = [1 + Math.round(Math.random() * (maxStep - 1))];
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
  const offsets = diagonalOffsets
    .concat(cardinalOffsets)
    .map(([x, y]) => [x * magnitude, y * magnitude]);

  const nonskippedOffset = offsets.filter((_, i) => skipList.indexOf(i) === -1);

  const offset =
    nonskippedOffset[Math.round(Math.random() * (nonskippedOffset.length - 1))];

  const oldXY = idxToXY(pivotPoint);
  let newXY = [
    Math.min(maxx - 1, Math.max(minx, oldXY[0] + offset[0])),
    Math.min(maxy - 1, Math.max(miny, oldXY[1] + offset[1])),
  ];

  if (offsets.indexOf(offset) < 4) {
    const maxMagnitude = Math.min(
      Math.abs(newXY[0] - oldXY[0]),
      Math.abs(newXY[1] - oldXY[1])
    );
    newXY = [
      oldXY[0] + (maxMagnitude * offset[0]) / Math.abs(offset[0]),
      oldXY[1] + (maxMagnitude * offset[1]) / Math.abs(offset[1]),
    ];
  }

  const perturbedPoint = xyToIdx(newXY as [number, number]);

  return [offsets.indexOf(offset), [pivotPoint, perturbedPoint]] as const;
};

const getLineArr = (prevPoints, shapeNum) => {
  const lines = [];
  prevPoints.forEach((p, i, arr) => {
    if (i != arr.length - 1 && i % shapeNum != shapeNum - 1) {
      lines.push([p, arr[i + 1]]);
    }
  });
  return lines;
};

// if can insert
const canInsert = (newLine, prevPoints, shapeNum, links) => {
  if (prevPoints.length >= 2) {
    let found = 0;
    let hitIntersection = false;
    for (const l of links) {
      // This need to
      if (!hitIntersection && l.indexOf(newLine[0]) >= 0) {
        //console.log('skipping for now');
        hitIntersection = true;
      } else if (lineIdxIntersects(newLine, l)) {
        //console.log('interesect with');
        //console.log(prettyPrint(newLine, l));
        return false;
      }
    }
  }
  return true;
};

export default function App() {
  const [a, sa] = React.useState(0);
  const [dhRatio, setDHRatio] = React.useState(0.5);
  const [maxStep, setMaxStep] = React.useState(10);
  const [shapeNum, setShapeNum] = React.useState(8);
  const [showPaths, setShowPath] = React.useState(false);

  const randArr = React.useMemo(
    () =>
      randomUniqArr(shapeNum * 3, shapeNum, (prev, prevPoints, links) => {
        if (prev === undefined || prevPoints.length % shapeNum === 0) {
          return [randIdx(), links];
        } else {
          let iterations = 0;
          let found = false;
          let skipList = [];
          const pivotPoint = prevPoints[prevPoints.length - 1];
          while (iterations <= 100) {
            const [offsetAttempt, newLine] = randomWalk({
              pivotPoint,
              maxStep,
              dhRatio,
              skipList,
            });

            if (canInsert(newLine, prevPoints, shapeNum, links)) {
              console.log(
                'completed after iterations',
                iterations,
                links,
                newLine
              );

              return [newLine[1], links, pivotPoint];
            }
            /*
        console.log(
          `Tried ${pDir[offsetAttempt]} with node ${pivotPoint} w skiplist: ${skipList}`
        );
        */
            if (skipList.length === 7) {
              //console.log('clearing skiplist');
              skipList = [];
            } else {
              skipList.push(offsetAttempt);
            }

            iterations++;
          }
          throw new Error('Exhausted iterations');
        }
      }).map(idxToXY),
    [a]
  );
  console.log(randArr);
  const hgrid = Array(height / dy)
    .fill(0)
    .map((_, i) => `M0 ${i * dy} L${width} ${i * dy}`)
    .join(' ');
  const vgrid = Array(width / dx)
    .fill(0)
    .map((_, i) => `M${i * dx} 0 L${i * dx} ${height}`)
    .join(' ');

  const pathLines = ['red', 'green', 'blue'].map((color, i) => {
    return (
      <ShapePath
        color={color}
        points={randArr
          .slice(shapeNum * i, shapeNum * (i + 1))
          .map((s) => xyToCart(s as [number, number]))}
      />
    );
  });

  const circles = (
    <React.Fragment>
      {randArr.slice(shapeNum * 0, shapeNum * 1).map(([randx, randy], i) => {
        return (
          <React.Fragment>
            <circle
              cx={dx * 0.5 + dx * randx}
              cy={dy * 0.5 + dy * randy}
              fill="red"
              r={dx / 3}
            />
            <text x={dx * 0.25 + dx * randx} y={dy * 0.75 + dy * randy}>
              {i}
            </text>
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
  const diamond = randArr
    .slice(shapeNum * 1, shapeNum * 2)
    .map(([randx, randy], i) => {
      return (
        <React.Fragment>
          <polygon
            points={`${-dx / 3 + dx * 0.5 + dx * randx}, ${
              dy / 3 + dy * 0.5 + dy * randy
            } ${-dx / 3 + dx * 0.5 + dx * randx}, ${
              -dy / 3 + dy * 0.5 + dy * randy
            } ${dx / 3 + dx * 0.5 + dx * randx}, ${
              -dy / 3 + dy * 0.5 + dy * randy
            } ${dx / 3 + dx * 0.5 + dx * randx}, ${
              dy / 3 + dy * 0.5 + dy * randy
            }`}
            fill="green"
            r={dx / 3}
          />{' '}
          <text x={dx * 0.25 + dx * randx} y={dy * 0.75 + dy * randy}>
            {i}
          </text>
        </React.Fragment>
      );
    });
  const triangle = randArr
    .slice(shapeNum * 2, shapeNum * 3)
    .map(([randx, randy], i) => {
      return (
        <React.Fragment>
          <polygon
            points={`${-dx / 3 + dx * 0.5 + dx * randx}, ${
              dy / 3 + dy * 0.5 + dy * randy
            } ${dx * 0.5 + dx * randx}, ${-dy / 3 + dy * 0.5 + dy * randy} ${
              dx / 3 + dx * 0.5 + dx * randx
            }, ${dy / 3 + dy * 0.5 + dy * randy}`}
            fill="blue"
            r={dx / 3}
          />{' '}
          <text x={dx * 0.25 + dx * randx} y={dy * 0.75 + dy * randy}>
            {i}
          </text>
        </React.Fragment>
      );
    });

  return (
    <div>
      <svg width={width} height={height} style={{ background: 'grey' }}>
        <path d={hgrid} stroke="white" />
        <path d={vgrid} stroke="white" />
        {circles}
        {triangle}
        {diamond}
        {showPaths && pathLines}
      </svg>
      <div>
        <button onClick={() => sa(a + 1)}>Refresh</button>
      </div>
      <div>
        <button onClick={() => setShowPath(!showPaths)}>Toggle Paths</button>
      </div>
      <div>
        <label>
          ShapeNum = {shapeNum}
          <input
            value={shapeNum}
            onChange={(a) => setShapeNum(+a.target.value)}
            min="0"
            max="30"
            step="1"
            type="range"
          />
        </label>
      </div>
      <div>
        <label>
          Max Step = {maxStep}
          <input
            value={maxStep}
            onChange={(a) => setMaxStep(+a.target.value)}
            min="0"
            max={maxx}
            step="1"
            type="range"
          />
        </label>
      </div>
    </div>
  );
}
