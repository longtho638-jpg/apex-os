import type { Edge, Node } from '@xyflow/react';

export function compileStrategy(nodes: Node[], edges: Edge[]) {
  // 1. Find Start Nodes (Indicators usually)
  // In a real compiler, we'd build a dependency graph.
  // Simplified: Just map nodes to a config object.

  const indicators = nodes
    .filter((n) => n.type === 'indicator')
    .map((n) => ({
      id: n.id,
      type: n.data.label,
      params: n.data.params,
    }));

  const logic = nodes
    .filter((n) => n.type === 'logic')
    .map((n) => ({
      id: n.id,
      condition: n.data.condition,
      inputs: edges.filter((e) => e.target === n.id).map((e) => e.source),
    }));

  const actions = nodes
    .filter((n) => n.type === 'action')
    .map((n) => ({
      id: n.id,
      type: n.data.action,
      trigger: edges.find((e) => e.target === n.id)?.source,
    }));

  return {
    indicators,
    logic,
    actions,
    version: '1.0',
  };
}
