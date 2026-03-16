import React from 'react';
import './Tab.css';

/**
 * Reusable Tab component.
 *
 * @param {Object[]} tabs      – Array of { id: string, label: string }
 * @param {string}   activeTab – Currently active tab id
 * @param {Function} onTabChange – Called with the tab id when clicked
 * @param {string}   [className] – Optional extra class on the container
 */
const Tab = ({ tabs, activeTab, onTabChange, className = '' }) => {
  return (
    <div className={`tab-container ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tab;
