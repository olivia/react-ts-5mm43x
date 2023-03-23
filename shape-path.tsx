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

export const LinePath = (props) => {
  return props.links.map(([[x1, y1], [x2, y2]]) => (
    <line x1={x1} x2={x2} y1={y1} y2={y2} fill="none" stroke={props.color} />
  ));
};
