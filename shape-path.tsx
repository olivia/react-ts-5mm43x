import * as React from 'react';
export const ShapePath = (props) => {
  return (
    <polyline
      points={props.points.map((p) => `${p[0]},${p[1]}`).join(' ')}
      fill="none"
      stroke={props.color}
    />
  );
};
