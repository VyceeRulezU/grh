import React, { useState } from 'react';
import './NigeriaMap.css';
import NIGERIA_SVG_DATA from '../../../data/nigeriaMapPaths';

const NigeriaMap = ({ data = [] }) => {
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
              <span className="value">{getHoverData(hoveredState).year}</span>
            </div>
            <div className="tooltip-row">
              <span className="label">Amount:</span>
              <span className="value highlight">{getHoverData(hoveredState).amount}</span>
            </div>
            <div className="tooltip-note">Actual Revenue / Expenditure</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NigeriaMap;
