import React, { useState } from 'react';
import './NigeriaMap.css';
import NIGERIA_SVG_DATA from '../../../data/nigeriaMapPaths';

const NigeriaMap = ({ data = [], showPins = false }) => {
  const [hoveredState, setHoveredState] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    });
  };

  const getHoverData = (stateName) => {
    return data.find(s => s.name === stateName) || { name: stateName, amount: "₦0", year: 2024 };
  };

  const states = NIGERIA_SVG_DATA.locations;

  // Pin coordinates for 11 states
  const PIN_COORDS = {
    'FCT': { x: 305, y: 310 },
    'Lagos': { x: 40, y: 465 },
    'Kaduna': { x: 340, y: 190 },
    'Kano': { x: 380, y: 110 },
    'Enugu': { x: 300, y: 450 },
    'Jigawa': { x: 460, y: 80 },
    'Anambra': { x: 270, y: 460 },
    'Katsina': { x: 340, y: 60 },
    'Yobe': { x: 580, y: 65 },
    'Borno': { x: 670, y: 90 },
    'Zamfara': { x: 260, y: 80 }
  };

  return (
    <div className="nigeria-map-container" onMouseMove={handleMouseMove}>
      <svg viewBox={NIGERIA_SVG_DATA.viewBox} className="nigeria-map-svg">
        <g className="states-group">
          {states.map((state) => (
            <path
              key={state.id}
              d={state.path}
              className={`state-path ${hoveredState === state.name ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredState(state.name)}
              onMouseLeave={() => setHoveredState(null)}
              fill={hoveredState === state.name ? "var(--primary)" : "#e2e8f0"}
              stroke="#fff"
              strokeWidth="1"
            />
          ))}
        </g>
        
        {/* Pins Layer */}
        {showPins && Object.entries(PIN_COORDS).map(([state, pos]) => (
          <g key={state} className="map-pin-group">
            <circle 
              cx={pos.x} 
              cy={pos.y} 
              r="12" 
              fill="var(--secondary)" 
              className="pin-pulse"
              opacity="0.3"
            />
            <circle 
              cx={pos.x} 
              cy={pos.y} 
              r="4" 
              fill="var(--secondary)" 
              className="pin-dot"
            />
          </g>
        ))}
      </svg>
      
      {hoveredState && (
        <div 
          className="map-tooltip" 
          style={{ 
            left: mousePos.x + 15, 
            top: mousePos.y + 15 
          }}
        >
          <div className="tooltip-header">{hoveredState} State</div>
          <div className="tooltip-body">
            <div className="tooltip-row">
              <span className="label">Year:</span>
              <span className="value">{getHoverData(hoveredState).year || 2024}</span>
            </div>
            <div className="tooltip-row">
              <span className="label">Focus:</span>
              <span className="value highlight">{getHoverData(hoveredState).amount}</span>
            </div>
            <div className="tooltip-note">GRH Regional Hub</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NigeriaMap;
