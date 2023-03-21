import * as React from 'react';
import './style.css';
import { maxx, height, width, dx, dy } from './constants';
import { ShapePath } from './shape-path';
import { randomPathFnCreator, randomUniqArr } from './random';
import { idxToXY, xyToCart } from './line-utils';

export default function App() {
  const [a, sa] = React.useState(0);
  const [maxStep, setMaxStep] = React.useState(20);
  const [shapeNum, setShapeNum] = React.useState(10);
  const [showPaths, setShowPath] = React.useState(false);

  const randArr = React.useMemo(() => {
    let iterations = 10;
    let res;
    while (iterations--) {
      res = randomUniqArr(
        shapeNum * 3,
        shapeNum,
        randomPathFnCreator({ shapeNum, maxStep })
      ).map(idxToXY);

      if (res.length > shapeNum * 2) {
        return res;
      }
    }
    return res;
  }, [a, shapeNum, maxStep]);

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
