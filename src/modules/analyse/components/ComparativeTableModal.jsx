import React, { useState, useMemo } from 'react';
import { COMPARATIVE_DATA, COMPARATIVE_OPTIONS } from '../../../data/comparativeData';
import './BudgetTableModal.css'; // Reuse existing styles

const ComparativeTableModal = ({ isOpen, onClose }) => {
  const [selectedStates, setSelectedStates] = useState(['bayelsa', 'abia', 'enugu']);
  const [budgetType, setBudgetType] = useState('Revised');
  const [category, setCategory] = useState('EXP BY ADMIN RECURRENT');
  const [year, setYear] = useState('2020');
  
  const [isStatesOpen, setIsStatesOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');

  // Available states from the data (based on the first row of any entry)
  const availableStates = useMemo(() => {
    // For simplicity, using a static list or deriving from the data keys
    // In a real app, this would be derived from the full state list
    return ['abia', 'adamawa', 'akwa_ibom', 'anambra', 'bauchi', 'bayelsa', 'benue', 'borno', 'cross_river', 'delta', 'ebonyi', 'edo', 'ekiti', 'enugu', 'fct', 'gombe', 'imo', 'jigawa', 'kaduna', 'kano', 'katsina', 'kebbi', 'kogi', 'kwara', 'lagos', 'nasarawa', 'niger', 'ogun', 'ondo', 'osun', 'oyo', 'plateau', 'rivers', 'sokoto', 'taraba', 'yobe', 'zamfara'];
  }, []);

  const filteredStatesForDropdown = availableStates.filter(s => 
    s.toLowerCase().replace(/_/g, ' ').includes(stateSearch.toLowerCase())
  );

  const toggleState = (state) => {
    setSelectedStates(prev => 
      prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
    );
  };

  const currentDataEntry = useMemo(() => {
    return COMPARATIVE_DATA.find(d => d.year === year && d.budgetType === budgetType && d.category === category);
  }, [year, budgetType, category]);

  const rows = currentDataEntry ? currentDataEntry.rows : [];

  if (!isOpen) return null;

  const handleExport = () => {
    // Implementation for CSV export
    const headers = ["Code", budgetType, ...selectedStates.map(s => s.toUpperCase())];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(row => {
          return [row.code, `"${row.name}"`, ...selectedStates.map(s => row[s] || "0")].join(",");
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `comparative_data_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="budget-modal-overlay" onClick={onClose}>
      <div className="budget-modal-container" onClick={e => e.stopPropagation()}>
        <div className="budget-modal-header">
          <div className="header-left">
            <div className="title-area">
              <span className="material-symbols-outlined theme-icon" style={{background: '#f0fdf4', color: '#16a34a'}}>balance</span>
              <div>
                <h2>Compare State Expenditure</h2>
                <p>Cross-state fiscal comparison and categorical analysis</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button className="action-btn-premium export" onClick={handleExport}>
              <span className="material-symbols-outlined">download</span>
              Export CSV
            </button>
            <button className="action-btn-premium print" onClick={() => window.print()}>
              <span className="material-symbols-outlined">print</span>
              Print
            </button>
            <button className="close-circle-btn" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="budget-modal-filters-v2" style={{borderBottom: 'none'}}>
          <div className="filter-row">
            
            <div className="filter-item">
              <label>Budget Type</label>
              <select value={budgetType} onChange={e => setBudgetType(e.target.value)} style={{width: '160px'}}>
                {COMPARATIVE_OPTIONS.budgetTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="filter-item states-dropdown-wrapper">
              <label>States ({selectedStates.length})</label>
              <div className={`custom-dropdown ${isStatesOpen ? 'open' : ''}`} onClick={() => setIsStatesOpen(!isStatesOpen)}>
                <div className="dropdown-trigger">
                  <span className="selected-text">
                    {selectedStates.length === 0 ? 'Select States' : selectedStates.slice(0,2).join(', ').toUpperCase() + (selectedStates.length > 2 ? '...' : '')}
                  </span>
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
                {isStatesOpen && (
                  <div className="dropdown-content" onClick={e => e.stopPropagation()}>
                    <div className="dropdown-search">
                      <input 
                        type="text" 
                        placeholder="Search states..." 
                        value={stateSearch}
                        onChange={e => setStateSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="dropdown-list">
                      {filteredStatesForDropdown.map(state => (
                        <div key={state} className="dropdown-item" onClick={() => toggleState(state)}>
                          <input type="checkbox" checked={selectedStates.includes(state)} readOnly />
                          <span>{state.replace(/_/g, ' ').toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="dropdown-footer">
                       <button onClick={() => setIsStatesOpen(false)}>Done</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="filter-item">
              <label>Budget Categories</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{width: '240px'}}>
                {COMPARATIVE_OPTIONS.categories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="filter-item">
              <label>Year</label>
              <select value={year} onChange={e => setYear(e.target.value)}>
                {COMPARATIVE_OPTIONS.years.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="filter-actions">
              <button className="reset-link" style={{background: '#0d9488', color: 'white', textDecoration: 'none', padding: '0 20px', borderRadius: '8px', height: '42px'}} onClick={() => {}}>Filter</button>
            </div>
          </div>
        </div>

        <div className="budget-modal-body-v2">
          <div className="adm-table-wrap">
            <table className="adm-table budget-themed">
              <thead>
                <tr>
                  <th style={{width: '120px'}}>Code</th>
                  <th style={{minWidth: '350px'}}>{budgetType}</th>
                  {selectedStates.map(state => (
                    <th key={state} className="num-header">{state.replace(/_/g, ' ').toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={selectedStates.length + 2} className="no-results">
                      <div style={{padding: '4rem', textAlign: 'center'}}>
                        <img src="/assets/icons/empty-state.svg" alt="" style={{width: '120px', margin: '0 auto 1rem', opacity: 0.5}} />
                        <p>No comparative data available for the selected filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : rows.map((row, idx) => (
                  <tr key={idx} className={!row.code ? 'category-row-v2' : ''}>
                    <td className="code-col">{row.code || '—'}</td>
                    <td className="name-col">
                      <div className="row-title" style={{textDecoration: (!row.code && row.name.includes('Recurrent')) ? 'underline' : 'none'}}>
                        {row.name}
                      </div>
                    </td>
                    {selectedStates.map(state => (
                      <td key={state} className="number-col">
                        {row[state] || (row[state] === 0 ? '0.00' : '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparativeTableModal;
