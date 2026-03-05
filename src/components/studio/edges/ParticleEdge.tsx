import { BaseEdge, type EdgeProps, getBezierPath } from '@xyflow/react';

export function ParticleEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <circle r="3" fill="#34D399">
        <animateMotion dur="1.5s" repeatCount="indefinite" path={edgePath} />
      </circle>
      <circle r="3" fill="#34D399">
        <animateMotion dur="1.5s" begin="0.75s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
}
