import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { X, LayoutGrid } from "lucide-react";
import { ClipBlock } from "@/app/components/node/ClipBlock";
import { EffectBlock as EffectBlockComponent } from "@/app/components/node/EffectBlock";
import { CanvasConnection } from "@/app/components/node/ConnectionLine";
import { AddEffectButton } from "@/app/components/node/AddEffectButton";
import { NodePort } from "@/app/components/node/NodePort";
import type { PortRegistry } from "@/app/components/node/NodePort";
import { useDragConnection } from "@/app/components/node/useDragConnection";
import { QuickAddMenu } from "@/app/components/node/QuickAddMenu";
import type {
  EffectBlock,
  CanvasNode,
  Connection,
  NodeGraph,
} from "@/app/types/nodeEffects";

import image1 from "../../assets/4ade86ef9dac706bb3957bd6282d330df1e57c89.png";
import image2 from "../../assets/c4945bd878c904a44e42b756d4a58bd0d542132d.png";
import image3 from "../../assets/7633c3f223e4bc39f692ecfd0b163fb92cb5ad4e.png";
import image4 from "../../assets/fdac420adeb4e37cb6c0fc58ae2eaac15892ec6c.png";
import image5 from "../../assets/3b60bf79536904eac8e068b551ee0f317c3a107f.png";

const CLIP_IMAGES = [image1, image2, image3, image4, image5];

const CLIPS = [
  { id: 0, title: "Introducing Log Explorer", color: "blue" as const },
  { id: 1, title: "Google Chrome Log Explorer Demo", color: "purple" as const },
  { id: 2, title: "Analytics Dashboard", color: "green" as const },
  { id: 3, title: "User Engagement Metrics", color: "orange" as const },
  { id: 4, title: "Summary & Next Steps", color: "teal" as const },
];

const NODE_WIDTH = 320;
const NODE_GAP_X = 40;
const NODE_GAP_Y = 72;
const CLIP_HEIGHT_ESTIMATE = 200;
const EFFECT_HEIGHT_ESTIMATE = 220;
const CANVAS_PADDING_X = 80;
const CANVAS_PADDING_Y = 40;

interface NodeCanvasProps {
  onClose: () => void;
  effectChains: Record<number, EffectBlock[]>;
  onEffectChainsChange: (chains: Record<number, EffectBlock[]>) => void;
  playheadTime?: number;
}

function buildGraphFromChains(
  effectChains: Record<number, EffectBlock[]>,
  existingGraph?: NodeGraph
): NodeGraph {
  const nodes: Record<string, CanvasNode> = {};
  const connections: Connection[] = [];

  CLIPS.forEach((clip, colIndex) => {
    const x = CANVAS_PADDING_X + colIndex * (NODE_WIDTH + NODE_GAP_X);
    const clipNodeId = `clip-${clip.id}`;

    const existing = existingGraph?.nodes[clipNodeId];
    nodes[clipNodeId] = {
      id: clipNodeId,
      type: "clip",
      position: existing ? existing.position : { x, y: CANVAS_PADDING_Y },
      clipId: clip.id,
      color: clip.color,
      title: clip.title,
    };

    const effects = effectChains[clip.id] || [];
    let prevNodeId = clipNodeId;

    effects.forEach((effect, effectIndex) => {
      const effectNodeId = `effect-${effect.id}`;
      const y =
        CANVAS_PADDING_Y +
        CLIP_HEIGHT_ESTIMATE +
        NODE_GAP_Y +
        effectIndex * (EFFECT_HEIGHT_ESTIMATE + NODE_GAP_Y);

      const existingEffect = existingGraph?.nodes[effectNodeId];
      nodes[effectNodeId] = {
        id: effectNodeId,
        type: "effect",
        position: existingEffect ? existingEffect.position : { x, y },
        clipId: clip.id,
        effectType: effect.effectType,
        prompt: effect.prompt,
      };

      connections.push({
        id: `conn-${prevNodeId}-${effectNodeId}`,
        sourceNodeId: prevNodeId,
        targetNodeId: effectNodeId,
      });

      prevNodeId = effectNodeId;
    });
  });

  return { nodes, connections };
}

function syncGraphToChains(
  graph: NodeGraph
): Record<number, EffectBlock[]> {
  const chains: Record<number, EffectBlock[]> = {};

  // Build adjacency: source → target[]
  const adjacency = new Map<string, string[]>();
  for (const conn of graph.connections) {
    const existing = adjacency.get(conn.sourceNodeId) || [];
    existing.push(conn.targetNodeId);
    adjacency.set(conn.sourceNodeId, existing);
  }

  // For each clip node, walk the chain following primary path (targets[0])
  for (const node of Object.values(graph.nodes)) {
    if (node.type !== "clip" || node.clipId === undefined) continue;

    const effects: EffectBlock[] = [];
    const visited = new Set<string>();
    let current = adjacency.get(node.id)?.[0];
    let order = 0;

    while (current && !visited.has(current)) {
      visited.add(current);
      const targetNode = graph.nodes[current];
      if (targetNode && targetNode.type === "effect") {
        effects.push({
          id: targetNode.id.replace("effect-", ""),
          clipId: node.clipId,
          effectType: targetNode.effectType || "Text",
          prompt: targetNode.prompt || "",
          order: order++,
        });
      }
      current = adjacency.get(current)?.[0];
    }

    chains[node.clipId] = effects;
  }

  return chains;
}

export function NodeCanvas({
  onClose,
  effectChains,
  onEffectChainsChange,
  playheadTime,
}: NodeCanvasProps) {
  const [graph, setGraph] = useState<NodeGraph>(() =>
    buildGraphFromChains(effectChains)
  );
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [quickAddMenu, setQuickAddMenu] = useState<{
    sourceNodeId: string;
    position: { x: number; y: number };
  } | null>(null);
  const [nodePositions, setNodePositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const portRegistry = useRef<PortRegistry>(new Map()).current;
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Re-derive graph when effectChains change from outside, preserving existing positions
  useEffect(() => {
    setGraph((prev) => buildGraphFromChains(effectChains, prev));
  }, [effectChains]);

  // Node drag-to-move
  useEffect(() => {
    if (!draggingNodeId) return;

    const handlePointerMove = (e: PointerEvent) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      const scrollEl = canvasRef.current?.parentElement;
      const scrollX = scrollEl?.scrollLeft ?? 0;
      const scrollY = scrollEl?.scrollTop ?? 0;
      const newX = e.clientX - canvasRect.left + scrollX - dragOffset.current.x;
      const newY = e.clientY - canvasRect.top + scrollY - dragOffset.current.y;

      setGraph((prev) => ({
        ...prev,
        nodes: {
          ...prev.nodes,
          [draggingNodeId]: {
            ...prev.nodes[draggingNodeId],
            position: { x: newX, y: newY },
          },
        },
      }));
    };

    const handlePointerUp = () => {
      setDraggingNodeId(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingNodeId]);

  const handleNodePointerDown = useCallback(
    (nodeId: string, e: React.PointerEvent) => {
      // Don't start drag if clicking on interactive elements or ports
      const target = e.target as HTMLElement;
      if (
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("button") ||
        target.closest("[data-port]")
      ) {
        return;
      }

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      const node = graph.nodes[nodeId];
      if (!node) return;

      const scrollEl = canvasRef.current?.parentElement;
      const scrollX = scrollEl?.scrollLeft ?? 0;
      const scrollY = scrollEl?.scrollTop ?? 0;

      dragOffset.current = {
        x: e.clientX - canvasRect.left + scrollX - node.position.x,
        y: e.clientY - canvasRect.top + scrollY - node.position.y,
      };
      setDraggingNodeId(nodeId);
    },
    [graph.nodes]
  );

  // Measure actual node positions for connection lines
  useEffect(() => {
    const measured: Record<string, { x: number; y: number }> = {};
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    nodeRefs.current.forEach((el, nodeId) => {
      const rect = el.getBoundingClientRect();
      measured[nodeId] = {
        x: rect.left - canvasRect.left + rect.width / 2,
        y: rect.top - canvasRect.top,
      };
    });
    setNodePositions(measured);
  });

  // Escape key handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (quickAddMenu) {
          e.preventDefault();
          e.stopPropagation();
          setQuickAddMenu(null);
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, quickAddMenu]);

  const updateGraphAndSync = useCallback(
    (updater: (prev: NodeGraph) => NodeGraph) => {
      setGraph((prev) => {
        const next = updater(prev);
        onEffectChainsChange(syncGraphToChains(next));
        return next;
      });
    },
    [onEffectChainsChange]
  );

  const handleConnect = useCallback(
    (sourceNodeId: string, targetNodeId: string) => {
      updateGraphAndSync((prev) => {
        // Don't allow self-connections
        if (sourceNodeId === targetNodeId) return prev;

        // Don't duplicate connections
        const exists = prev.connections.some(
          (c) =>
            c.sourceNodeId === sourceNodeId && c.targetNodeId === targetNodeId
        );
        if (exists) return prev;

        return {
          ...prev,
          connections: [
            ...prev.connections,
            {
              id: `conn-${sourceNodeId}-${targetNodeId}`,
              sourceNodeId,
              targetNodeId,
            },
          ],
        };
      });
    },
    [updateGraphAndSync]
  );

  const handleDropOnCanvas = useCallback(
    (sourceNodeId: string, position: { x: number; y: number }) => {
      setQuickAddMenu({ sourceNodeId, position });
    },
    []
  );

  const { dragState, startDrag } = useDragConnection({
    portRegistry,
    canvasRef,
    onConnect: handleConnect,
    onDropOnCanvas: handleDropOnCanvas,
  });

  const handleQuickAddSelect = useCallback(
    (effectType: string) => {
      if (!quickAddMenu) return;

      const newId = `${Date.now()}`;
      const newNodeId = `effect-${newId}`;

      updateGraphAndSync((prev) => {
        const newNode: CanvasNode = {
          id: newNodeId,
          type: "effect",
          position: {
            x: quickAddMenu.position.x - NODE_WIDTH / 2,
            y: quickAddMenu.position.y,
          },
          effectType,
          prompt: "",
          clipId: prev.nodes[quickAddMenu.sourceNodeId]?.clipId,
        };

        return {
          nodes: { ...prev.nodes, [newNodeId]: newNode },
          connections: [
            ...prev.connections,
            {
              id: `conn-${quickAddMenu.sourceNodeId}-${newNodeId}`,
              sourceNodeId: quickAddMenu.sourceNodeId,
              targetNodeId: newNodeId,
            },
          ],
        };
      });

      setQuickAddMenu(null);
    },
    [quickAddMenu, updateGraphAndSync]
  );

  const handleAddEffect = useCallback(
    (clipId: number, effectType: string) => {
      const newId = `${clipId}-${Date.now()}`;
      const newNodeId = `effect-${newId}`;

      updateGraphAndSync((prev) => {
        // Find the last node in this clip's chain
        const clipNodeId = `clip-${clipId}`;
        const adjacency = new Map<string, string[]>();
        for (const conn of prev.connections) {
          const existing = adjacency.get(conn.sourceNodeId) || [];
          existing.push(conn.targetNodeId);
          adjacency.set(conn.sourceNodeId, existing);
        }

        let lastNodeId = clipNodeId;
        const visited = new Set<string>();
        let current = adjacency.get(clipNodeId)?.[0];
        while (current && !visited.has(current)) {
          visited.add(current);
          lastNodeId = current;
          current = adjacency.get(current)?.[0];
        }

        const lastNode = prev.nodes[lastNodeId];
        const newY = lastNode
          ? lastNode.position.y +
            (lastNode.type === "clip"
              ? CLIP_HEIGHT_ESTIMATE
              : EFFECT_HEIGHT_ESTIMATE) +
            NODE_GAP_Y
          : CANVAS_PADDING_Y + CLIP_HEIGHT_ESTIMATE + NODE_GAP_Y;

        const newNode: CanvasNode = {
          id: newNodeId,
          type: "effect",
          position: {
            x: lastNode?.position.x ?? CANVAS_PADDING_X,
            y: newY,
          },
          clipId,
          effectType,
          prompt: "",
        };

        return {
          nodes: { ...prev.nodes, [newNodeId]: newNode },
          connections: [
            ...prev.connections,
            {
              id: `conn-${lastNodeId}-${newNodeId}`,
              sourceNodeId: lastNodeId,
              targetNodeId: newNodeId,
            },
          ],
        };
      });
    },
    [updateGraphAndSync]
  );

  const handleRemoveEffect = useCallback(
    (clipId: number, effectId: string) => {
      const nodeId = `effect-${effectId}`;

      updateGraphAndSync((prev) => {
        // Find ALL incoming and outgoing connections for this node
        const incomingConns = prev.connections.filter(
          (c) => c.targetNodeId === nodeId
        );
        const outgoingConns = prev.connections.filter(
          (c) => c.sourceNodeId === nodeId
        );

        // Remove connections to/from this node
        let newConnections = prev.connections.filter(
          (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
        );

        // Bridge ALL incoming sources to ALL outgoing targets
        for (const incoming of incomingConns) {
          for (const outgoing of outgoingConns) {
            newConnections.push({
              id: `conn-${incoming.sourceNodeId}-${outgoing.targetNodeId}`,
              sourceNodeId: incoming.sourceNodeId,
              targetNodeId: outgoing.targetNodeId,
            });
          }
        }

        const { [nodeId]: _removed, ...remainingNodes } = prev.nodes;
        return { nodes: remainingNodes, connections: newConnections };
      });
    },
    [updateGraphAndSync]
  );

  const handlePromptChange = useCallback(
    (_clipId: number, effectId: string, prompt: string) => {
      const nodeId = `effect-${effectId}`;
      setGraph((prev) => ({
        ...prev,
        nodes: {
          ...prev.nodes,
          [nodeId]: { ...prev.nodes[nodeId], prompt },
        },
      }));
      onEffectChainsChange(
        syncGraphToChains({
          ...graph,
          nodes: {
            ...graph.nodes,
            [nodeId]: { ...graph.nodes[nodeId], prompt },
          },
        })
      );
    },
    [graph, onEffectChainsChange]
  );

  // Compute connection line endpoints from measured positions
  const connectionLines = useMemo(() => {
    return graph.connections.map((conn) => {
      const sourcePos = nodePositions[conn.sourceNodeId];
      const targetPos = nodePositions[conn.targetNodeId];

      if (!sourcePos || !targetPos) return null;

      const sourceNode = graph.nodes[conn.sourceNodeId];
      const sourceEl = nodeRefs.current.get(conn.sourceNodeId);
      const sourceHeight = sourceEl?.offsetHeight ?? (sourceNode?.type === "clip" ? CLIP_HEIGHT_ESTIMATE : EFFECT_HEIGHT_ESTIMATE);

      return {
        id: conn.id,
        from: {
          x: sourcePos.x,
          y: sourcePos.y + sourceHeight + 12,
        },
        to: {
          x: targetPos.x,
          y: targetPos.y - 12,
        },
        isHovered:
          hoveredBlockId === conn.sourceNodeId ||
          hoveredBlockId === conn.targetNodeId,
      };
    });
  }, [graph.connections, graph.nodes, nodePositions, hoveredBlockId]);

  // Compute drag line position relative to canvas
  const dragLine = useMemo(() => {
    if (!dragState || !canvasRef.current) return null;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    return {
      from: {
        x: dragState.sourcePosition.x - canvasRect.left,
        y: dragState.sourcePosition.y - canvasRect.top,
      },
      to: {
        x: dragState.cursorPosition.x - canvasRect.left,
        y: dragState.cursorPosition.y - canvasRect.top,
      },
    };
  }, [dragState]);

  // Determine which nodes have connections (for port styling)
  const connectedOutputs = useMemo(() => {
    const set = new Set<string>();
    for (const conn of graph.connections) {
      set.add(conn.sourceNodeId);
    }
    return set;
  }, [graph.connections]);

  const connectedInputs = useMemo(() => {
    const set = new Set<string>();
    for (const conn of graph.connections) {
      set.add(conn.targetNodeId);
    }
    return set;
  }, [graph.connections]);

  // Format playhead time for display
  const formattedTime = useMemo(() => {
    if (playheadTime === undefined) return null;
    const totalSeconds = Math.floor(playheadTime);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [playheadTime]);

  return (
    <div className="absolute inset-0 bg-[#0e1015] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#25272b] shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[#888] hover:text-white transition-colors cursor-pointer"
        >
          <X className="size-5" />
          <span className="text-sm font-medium">Close</span>
        </button>
        <div className="flex items-center gap-3 text-white/60">
          <div className="flex items-center gap-2">
            <LayoutGrid className="size-4" />
            <span className="text-sm font-medium">Node Effects</span>
          </div>
          {formattedTime && (
            <span className="text-xs font-mono text-white/40">{formattedTime}</span>
          )}
        </div>
        <div className="w-[80px]" />
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto">
        <div
          ref={canvasRef}
          className="relative min-h-full"
          style={{
            minWidth:
              CANVAS_PADDING_X * 2 +
              CLIPS.length * NODE_WIDTH +
              (CLIPS.length - 1) * NODE_GAP_X,
            minHeight: 800,
          }}
        >
          {/* SVG overlay for connection lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: "100%", height: "100%", overflow: "visible" }}
          >
            {connectionLines.map(
              (line) =>
                line && (
                  <CanvasConnection
                    key={line.id}
                    from={line.from}
                    to={line.to}
                    isHovered={line.isHovered}
                  />
                )
            )}
            {dragLine && (
              <CanvasConnection
                from={dragLine.from}
                to={dragLine.to}
                isActive
              />
            )}
          </svg>

          {/* Render all nodes flat */}
          {Object.values(graph.nodes).map((node) => {
            if (node.type === "clip") {
              const clip = CLIPS.find((c) => c.id === node.clipId);
              if (!clip) return null;

              return (
                <div
                  key={node.id}
                  className="absolute"
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    cursor: draggingNodeId === node.id ? "grabbing" : "grab",
                  }}
                  onPointerDown={(e) => handleNodePointerDown(node.id, e)}
                >
                  <div
                    ref={(el) => {
                      if (el) nodeRefs.current.set(node.id, el);
                      else nodeRefs.current.delete(node.id);
                    }}
                  >
                    <ClipBlock
                      clipId={clip.id}
                      title={clip.title}
                      color={clip.color}
                      imageSrc={CLIP_IMAGES[clip.id]}
                      isHovered={hoveredBlockId === node.id}
                      onHover={(h) =>
                        setHoveredBlockId(h ? node.id : null)
                      }
                      layoutId={`clip-${clip.id}`}
                    />
                  </div>

                  {/* Output port for clip */}
                  <div className="flex justify-center">
                    <NodePort
                      nodeId={node.id}
                      type="output"
                      portRegistry={portRegistry}
                      isActive={
                        dragState?.nearPortNodeId === node.id ||
                        dragState?.sourceNodeId === node.id
                      }
                      isConnected={connectedOutputs.has(node.id)}
                      onDragStart={startDrag}
                    />
                  </div>

                  {/* Add effect button */}
                  <div className="mt-4">
                    <AddEffectButton
                      onAddEffect={(type) => handleAddEffect(clip.id, type)}
                    />
                  </div>
                </div>
              );
            }

            // Effect node
            const effectId = node.id.replace("effect-", "");
            const clipId = node.clipId ?? 0;

            return (
              <div
                key={node.id}
                className="absolute"
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  cursor: draggingNodeId === node.id ? "grabbing" : "grab",
                }}
                onPointerDown={(e) => handleNodePointerDown(node.id, e)}
              >
                {/* Input port */}
                <div className="flex justify-center">
                  <NodePort
                    nodeId={node.id}
                    type="input"
                    portRegistry={portRegistry}
                    isActive={
                      dragState?.nearPortNodeId === node.id
                    }
                    isConnected={connectedInputs.has(node.id)}
                  />
                </div>

                {/* Effect block */}
                <div
                  ref={(el) => {
                    if (el) nodeRefs.current.set(node.id, el);
                    else nodeRefs.current.delete(node.id);
                  }}
                >
                  <EffectBlockComponent
                    id={effectId}
                    effectType={node.effectType || "Text"}
                    prompt={node.prompt || ""}
                    imageSrc={CLIP_IMAGES[clipId]}
                    onPromptChange={(id, prompt) =>
                      handlePromptChange(clipId, id, prompt)
                    }
                    onRemove={(id) =>
                      handleRemoveEffect(clipId, id)
                    }
                    isHovered={hoveredBlockId === node.id}
                    onHover={(h) =>
                      setHoveredBlockId(h ? node.id : null)
                    }
                  />
                </div>

                {/* Output port */}
                <div className="flex justify-center">
                  <NodePort
                    nodeId={node.id}
                    type="output"
                    portRegistry={portRegistry}
                    isActive={
                      dragState?.nearPortNodeId === node.id ||
                      dragState?.sourceNodeId === node.id
                    }
                    isConnected={connectedOutputs.has(node.id)}
                    onDragStart={startDrag}
                  />
                </div>
              </div>
            );
          })}

          {/* Quick add menu */}
          {quickAddMenu && (
            <QuickAddMenu
              position={quickAddMenu.position}
              onSelect={handleQuickAddSelect}
              onClose={() => setQuickAddMenu(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
