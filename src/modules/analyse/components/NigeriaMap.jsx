import React, { useState, useEffect, useRef } from 'react';
import './NigeriaMap.css';
import NIGERIA_SVG_DATA from '../../../data/nigeriaMapPaths';

export const PINNED_STATES_NAMES = ['Ekiti', 'Kwara', 'Benue', 'Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo', 'Lagos', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Katsina', 'Kano', 'Yobe', 'Kaduna', 'Jigawa', 'Borno', 'Zamfara', 'Federal Capital Territory'];
const NAME_MAP = { 'Federal Capital Territory': 'FCT' };

const NigeriaMap = ({ data = [], showPins = false, highlightPinnedStates = false, showTooltip = true }) => {
  const [hoveredState, setHoveredState] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [pinCoords, setPinCoords] = useState({});
  const svgRef = useRef(null);

  useEffect(() => {
    if (showPins && svgRef.current) {
      const newCoords = {};
      
      const paths = svgRef.current.querySelectorAll('.state-path');
      paths.forEach(path => {
        const stateName = path.getAttribute('data-name');
        const mapName = NAME_MAP[stateName] || stateName;
        if (PINNED_STATES_NAMES.includes(stateName) || PINNED_STATES_NAMES.includes(mapName)) {
           const bbox = path.getBBox();
           newCoords[mapName] = {
             x: bbox.x + bbox.width / 2,
             y: bbox.y + bbox.height / 2
           };
        }
      });
      setPinCoords(newCoords);
    }
  }, [showPins]);

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
      <svg ref={svgRef} viewBox={NIGERIA_SVG_DATA.viewBox} className="nigeria-map-svg">
        <g className="states-group">
          {states.map((state) => (
            <path
              key={state.id}
              data-name={state.name}
              d={state.path}
              className={`state-path ${hoveredState === state.name ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredState(state.name)}
              onMouseLeave={() => setHoveredState(null)}
              fill={
                hoveredState === state.name 
                  ? "var(--primary)" 
                  : (highlightPinnedStates && PINNED_STATES_NAMES.includes(state.name))
                      ? "var(--secondary)" 
                      : "#e2e8f0"
              }
              stroke="#fff"
              strokeWidth="1"
            />
          ))}
        </g>
        
        {/* Pins Layer */}
        {showPins && Object.entries(pinCoords).map(([state, pos]) => (
          <g key={state} className="map-pin-group" transform={`translate(${pos.x - 12}, ${pos.y - 22})`}>
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              fill="var(--sc-destructive, #ef4444)"
              className="pin-dot"
            />
          </g>
        ))}
      </svg>
      
      {/* Tooltip commented out as requested */}
      {/* {showTooltip && hoveredState && (
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
      )} */}
    </div>
  );
};

export default NigeriaMap;
