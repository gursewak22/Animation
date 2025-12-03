import React, { useState, useEffect } from 'react';

const LabelPropagationAnimation = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1500);

  // Graph: 5 nodes (0-4) with edges forming two clusters
  // Cluster 1: 0-1-2 (triangle)
  // Cluster 2: 3-4 (connected to cluster 1 via edge 2-3)
  const edges = [
    [0, 1], [1, 2], [0, 2],  // Triangle
    [2, 3], [3, 4]           // Bridge to second cluster
  ];

  const nodePositions = [
    { x: 120, y: 100 },  // Node 0
    { x: 220, y: 60 },   // Node 1
    { x: 220, y: 140 },  // Node 2
    { x: 320, y: 100 },  // Node 3
    { x: 420, y: 100 },  // Node 4
  ];

  // Animation states
  const states = [
    // Initial state - each node has its own label
    {
      phase: 'init',
      description: 'Initialize: Each vertex gets its own ID as label',
      labels: [0, 1, 2, 3, 4],
      agentPositions: [0, 1, 2, 3, 4],
      agentCarrying: [0, 1, 2, 3, 4],
      highlight: [],
      moving: []
    },
    // Iteration 1: Agents go to neighbors
    {
      phase: 'migrate',
      description: 'Iteration 1: Agents migrate to first neighbor',
      labels: [0, 1, 2, 3, 4],
      agentPositions: [1, 0, 0, 2, 3],  // Each goes to first neighbor
      agentCarrying: [0, 1, 2, 3, 4],
      highlight: [],
      moving: [0, 1, 2, 3, 4]
    },
    // Agents collect labels
    {
      phase: 'collect',
      description: 'Agents collect neighbor labels',
      labels: [0, 1, 2, 3, 4],
      agentPositions: [1, 0, 0, 2, 3],
      agentCarrying: [0, 1, 2, 3, 4],
      collected: { 0: [1], 1: [0], 2: [0], 3: [2], 4: [3] },
      highlight: [0, 1, 2, 3, 4],
      moving: []
    },
    // Agents return home
    {
      phase: 'return',
      description: 'Agents return home',
      labels: [0, 1, 2, 3, 4],
      agentPositions: [0, 1, 2, 3, 4],
      agentCarrying: [0, 1, 2, 3, 4],
      collected: { 0: [1], 1: [0], 2: [0], 3: [2], 4: [3] },
      highlight: [],
      moving: [0, 1, 2, 3, 4]
    },
    // Visit second neighbor
    {
      phase: 'migrate2',
      description: 'Agents migrate to second neighbor',
      labels: [0, 1, 2, 3, 4],
      agentPositions: [2, 2, 1, 4, -1],  // -1 means no second neighbor
      agentCarrying: [0, 1, 2, 3, 4],
      collected: { 0: [1], 1: [0], 2: [0], 3: [2], 4: [3] },
      highlight: [],
      moving: [0, 1, 2, 3]
    },
    // Collect again
    {
      phase: 'collect2',
      description: 'Agents collect more labels',
      labels: [0, 1, 2, 3, 4],
      agentPositions: [2, 2, 1, 4, -1],
      agentCarrying: [0, 1, 2, 3, 4],
      collected: { 0: [1, 2], 1: [0, 2], 2: [0, 1], 3: [2, 4], 4: [3] },
      highlight: [0, 1, 2, 3],
      moving: []
    },
    // Return home again
    {
      phase: 'return2',
      description: 'Agents return home',
      labels: [0, 1, 2, 3, 4],
      agentPositions: [0, 1, 2, 3, 4],
      agentCarrying: [0, 1, 2, 3, 4],
      collected: { 0: [1, 2], 1: [0, 2], 2: [0, 1], 3: [2, 4], 4: [3] },
      highlight: [],
      moving: [0, 1, 2, 3]
    },
    // Update labels - majority vote
    {
      phase: 'update',
      description: 'Majority vote: Vertices update labels',
      labels: [2, 2, 2, 4, 4],  // 0,1,2 -> label 2 (max in tie), 3,4 -> label 4
      agentPositions: [0, 1, 2, 3, 4],
      agentCarrying: [2, 2, 2, 4, 4],
      votes: {
        0: { 0: 1, 1: 1, 2: 1 },  // tie -> keep or max
        1: { 1: 1, 0: 1, 2: 1 },
        2: { 2: 1, 0: 1, 1: 1 },
        3: { 3: 1, 2: 1, 4: 1 },
        4: { 4: 1, 3: 1 }
      },
      highlight: [0, 1, 2, 3, 4],
      moving: []
    },
    // Iteration 2: migrate
    {
      phase: 'iter2_migrate',
      description: 'Iteration 2: Agents migrate to neighbors',
      labels: [2, 2, 2, 4, 4],
      agentPositions: [1, 0, 0, 2, 3],
      agentCarrying: [2, 2, 2, 4, 4],
      highlight: [],
      moving: [0, 1, 2, 3, 4]
    },
    // Collect
    {
      phase: 'iter2_collect',
      description: 'Agents collect neighbor labels',
      labels: [2, 2, 2, 4, 4],
      agentPositions: [1, 0, 0, 2, 3],
      agentCarrying: [2, 2, 2, 4, 4],
      collected: { 0: [2], 1: [2], 2: [2], 3: [2], 4: [4] },
      highlight: [0, 1, 2, 3, 4],
      moving: []
    },
    // Return
    {
      phase: 'iter2_return',
      description: 'Agents return home',
      labels: [2, 2, 2, 4, 4],
      agentPositions: [0, 1, 2, 3, 4],
      agentCarrying: [2, 2, 2, 4, 4],
      collected: { 0: [2], 1: [2], 2: [2], 3: [2], 4: [4] },
      highlight: [],
      moving: [0, 1, 2, 3, 4]
    },
    // Final update
    {
      phase: 'converged',
      description: '✓ Converged! Two communities found: {0,1,2,3} and {4}',
      labels: [2, 2, 2, 2, 4],  // Node 3 joins cluster with label 2
      agentPositions: [0, 1, 2, 3, 4],
      agentCarrying: [2, 2, 2, 2, 4],
      highlight: [],
      moving: []
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      setStep((prev) => (prev + 1) % states.length);
    }, speed);
    return () => clearTimeout(timer);
  }, [step, isPlaying, speed]);

  const currentState = states[step];
  
  const labelColors = {
    0: '#FF6B6B',
    1: '#4ECDC4',
    2: '#45B7D1',
    3: '#96CEB4',
    4: '#FFEAA7'
  };

  const getNodeColor = (label) => labelColors[label] || '#888';

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      minHeight: '100vh',
      padding: '20px',
      color: '#eee'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 5px currentColor); }
          50% { filter: drop-shadow(0 0 15px currentColor); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
      
      <h1 style={{
        textAlign: 'center',
        fontSize: '28px',
        marginBottom: '10px',
        background: 'linear-gradient(90deg, #45B7D1, #96CEB4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 30px rgba(69, 183, 209, 0.3)'
      }}>
        Agent-Based Label Propagation
      </h1>
      
      <p style={{
        textAlign: 'center',
        color: '#aaa',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        Community Detection Algorithm Visualization
      </p>

      {/* Main visualization */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '16px',
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <svg viewBox="0 0 540 220" style={{ width: '100%', height: 'auto' }}>
          {/* Edges */}
          {edges.map(([a, b], i) => (
            <line
              key={i}
              x1={nodePositions[a].x}
              y1={nodePositions[a].y}
              x2={nodePositions[b].x}
              y2={nodePositions[b].y}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
          ))}
          
          {/* Nodes */}
          {nodePositions.map((pos, i) => (
            <g key={i}>
              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={30}
                fill={getNodeColor(currentState.labels[i])}
                stroke={currentState.highlight.includes(i) ? '#fff' : 'rgba(255,255,255,0.3)'}
                strokeWidth={currentState.highlight.includes(i) ? 3 : 2}
                style={{
                  animation: currentState.highlight.includes(i) ? 'pulse 0.5s ease-in-out' : 'none',
                  transition: 'fill 0.5s ease'
                }}
              />
              {/* Node ID */}
              <text
                x={pos.x}
                y={pos.y - 8}
                textAnchor="middle"
                fill="#fff"
                fontSize="12"
                fontWeight="bold"
              >
                V{i}
              </text>
              {/* Label */}
              <text
                x={pos.x}
                y={pos.y + 8}
                textAnchor="middle"
                fill="#fff"
                fontSize="14"
                fontWeight="bold"
              >
                L:{currentState.labels[i]}
              </text>
            </g>
          ))}
          
          {/* Agents */}
          {currentState.agentPositions.map((pos, i) => {
            if (pos === -1) return null;
            const targetPos = nodePositions[pos];
            const offset = (i % 3 - 1) * 15;  // Spread agents slightly
            return (
              <g key={`agent-${i}`}>
                <circle
                  cx={targetPos.x + offset}
                  cy={targetPos.y + 45}
                  r={12}
                  fill="#222"
                  stroke={getNodeColor(currentState.agentCarrying[i])}
                  strokeWidth="3"
                  style={{
                    animation: currentState.moving.includes(i) ? 'float 0.5s ease-in-out' : 'none',
                    transition: 'all 0.5s ease'
                  }}
                />
                <text
                  x={targetPos.x + offset}
                  y={targetPos.y + 49}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="10"
                  fontWeight="bold"
                >
                  A{i}
                </text>
              </g>
            );
          })}
          
          {/* Legend */}
          <g transform="translate(10, 180)">
            <circle cx={10} cy={10} r={8} fill="#222" stroke="#45B7D1" strokeWidth="2" />
            <text x={25} y={14} fill="#aaa" fontSize="11">= Agent</text>
            <circle cx={100} cy={10} r={8} fill="#45B7D1" />
            <text x={115} y={14} fill="#aaa" fontSize="11">= Vertex</text>
          </g>
        </svg>

        {/* Status */}
        <div style={{
          background: 'rgba(69, 183, 209, 0.1)',
          border: '1px solid rgba(69, 183, 209, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#45B7D1' }}>
            Step {step + 1}/{states.length}
          </div>
          <div style={{ fontSize: '14px', marginTop: '5px', color: '#eee' }}>
            {currentState.description}
          </div>
        </div>

        {/* Collected labels display */}
        {currentState.collected && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <div style={{ color: '#96CEB4', marginBottom: '5px', fontWeight: 'bold' }}>
              Collected Labels:
            </div>
            {Object.entries(currentState.collected).map(([agent, labels]) => (
              <div key={agent} style={{ color: '#aaa' }}>
                Agent {agent}: [{labels.join(', ')}]
              </div>
            ))}
          </div>
        )}

        {/* Vote display */}
        {currentState.votes && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <div style={{ color: '#FFEAA7', marginBottom: '5px', fontWeight: 'bold' }}>
              Majority Vote:
            </div>
            {Object.entries(currentState.votes).map(([vertex, votes]) => (
              <div key={vertex} style={{ color: '#aaa' }}>
                V{vertex}: {Object.entries(votes).map(([l, c]) => `L${l}:${c}`).join(', ')} 
                → <span style={{ color: getNodeColor(currentState.labels[vertex]) }}>L{currentState.labels[vertex]}</span>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '20px'
        }}>
          <button
            onClick={() => setStep((prev) => (prev - 1 + states.length) % states.length)}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ◀ Prev
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: '8px 20px',
              background: isPlaying ? 'rgba(255,107,107,0.3)' : 'rgba(78,205,196,0.3)',
              border: `1px solid ${isPlaying ? '#FF6B6B' : '#4ECDC4'}`,
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={() => setStep((prev) => (prev + 1) % states.length)}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Next ▶
          </button>
        </div>

        {/* Speed control */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          marginTop: '15px',
          color: '#aaa',
          fontSize: '12px'
        }}>
          <span>Speed:</span>
          <input
            type="range"
            min="500"
            max="3000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: '100px' }}
          />
          <span>{(speed / 1000).toFixed(1)}s</span>
        </div>
      </div>

      {/* Algorithm explanation */}
      <div style={{
        maxWidth: '600px',
        margin: '20px auto',
        padding: '20px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '12px',
        fontSize: '13px',
        lineHeight: '1.6'
      }}>
        <h3 style={{ color: '#45B7D1', marginBottom: '10px' }}>Algorithm Steps:</h3>
        <ol style={{ paddingLeft: '20px', color: '#bbb' }}>
          <li><strong>Initialize:</strong> Each vertex gets its own ID as label</li>
          <li><strong>Migrate:</strong> Each agent visits its vertex's neighbors</li>
          <li><strong>Collect:</strong> Agent collects neighbor's current label</li>
          <li><strong>Return:</strong> Agent returns to home vertex</li>
          <li><strong>Update:</strong> Majority vote - vertex adopts most common neighbor label</li>
          <li><strong>Repeat:</strong> Until no labels change (converged)</li>
        </ol>
      </div>
    </div>
  );
};

export default LabelPropagationAnimation;
