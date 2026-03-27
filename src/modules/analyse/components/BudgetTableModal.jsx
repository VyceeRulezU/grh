import React, { useState, useMemo } from 'react';
import './BudgetTableModal.css';

const BudgetTableModal = ({ isOpen, onClose, type, data }) => {
  const [isStatesOpen, setIsStatesOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2024');

  const titleMap = {
    original: 'Original Budget',
    actual: 'Actual',
    indicators: 'Performance Indicators'
  };

  const title = titleMap[type] || 'Budget Data';

  // Get available states (filtering out non-state columns)
  const availableStates = useMemo(() => {
    if (!data || data.length === 0) return [];
    const firstRow = data.find(row => row.abia || row.adamawa);
    if (!firstRow) return [];
    
    const excluded = ['code', 'original_budget', 'actual', 'indicators', 'name', 'empty'];
    return Object.keys(firstRow).filter(key => !excluded.includes(key)).sort();
  }, [data]);

  const filteredStates = availableStates.filter(s => 
    s.toLowerCase().replace(/_/g, ' ').includes(stateSearch.toLowerCase())
  );

  // Filter and search logic
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    return data.filter(row => {
      const rowName = (row.original_budget || row.actual || row.indicators || row.name || '').toLowerCase();
      const matchesSearch = rowName.includes(searchTerm.toLowerCase()) || (row.code && row.code.includes(searchTerm));
      return matchesSearch;
    });
  }, [data, searchTerm]);

  const displayColumns = selectedStates.length > 0 ? selectedStates : availableStates;

  if (!isOpen) return null;

  const toggleState = (state) => {
    setSelectedStates(prev => 
      prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
    );
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Code", "Description", ...displayColumns.map(s => s.toUpperCase())].join(",") + "\n"
      + filteredData.map(row => {
          const name = row.original_budget || row.actual || row.indicators || row.name || "";
          return [row.code, `"${name.replace(/"/g, '""')}"`, ...displayColumns.map(s => row[s] || "0")].join(",");
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_budget_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="budget-modal-overlay" onClick={onClose}>
      <div className="budget-modal-container" onClick={e => e.stopPropagation()}>
        <div className="budget-modal-header">
          <div className="header-left">
            <div className="title-area">
              <span className="material-symbols-outlined theme-icon">analytics</span>
              <div>
                <h2>{title}</h2>
                <p>Fiscal data analysis and state-level breakdown</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button className="action-btn-premium export" onClick={handleExport}>
              <span className="material-symbols-outlined">download</span>
              Export CSV
            </button>
            <button className="action-btn-premium print" onClick={handlePrint}>
              <span className="material-symbols-outlined">print</span>
              Print
            </button>
            <button className="close-circle-btn" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="budget-modal-filters-v2">
          <div className="filter-row">
            <div className="filter-item search-box">
              <label>Search Analysis</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined">search</span>
                <input 
                  type="text" 
                  placeholder="Filter by code or description..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-item states-dropdown-wrapper">
              <label>Select States ({selectedStates.length || 'All'})</label>
              <div className={`custom-dropdown ${isStatesOpen ? 'open' : ''}`} onClick={() => setIsStatesOpen(!isStatesOpen)}>
                <div className="dropdown-trigger">
                  <span className="selected-text">
                    {selectedStates.length === 0 ? 'All States' : `${selectedStates.length} States Selected`}
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
                      <div className="dropdown-item" onClick={() => setSelectedStates([])}>
                        <input type="checkbox" checked={selectedStates.length === 0} readOnly />
                        <span>All States</span>
                      </div>
                      {filteredStates.map(state => (
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

            <div className="filter-item year-box">
              <label>Fiscal Year</label>
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>

            <div className="filter-actions">
               <button className="reset-link" onClick={() => {
                 setSelectedStates([]);
                 setSearchTerm('');
                 setStateSearch('');
               }}>Clear All Filters</button>
            </div>
          </div>
        </div>

        <div className="budget-modal-body-v2">
          <div className="adm-table-wrap">
            <table className="adm-table budget-themed">
              <thead>
                <tr>
                  <th style={{width: '120px'}}>Code</th>
                  <th style={{minWidth: '350px'}}>Description</th>
                  {displayColumns.map(state => (
                    <th key={state} className="num-header">{state.replace(/_/g, ' ').toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={displayColumns.length + 2} className="no-results">
                      <span className="material-symbols-outlined">search_off</span>
                      <p>No matching budget records found</p>
                    </td>
                  </tr>
                ) : filteredData.map((row, idx) => (
                  <tr key={idx} className={!row.code ? 'category-row-v2' : ''}>
                    <td className="code-col">{row.code || '—'}</td>
                    <td className="name-col">
                      <div className="row-title">
                        {row.original_budget || row.actual || row.indicators || row.name}
                      </div>
                    </td>
                    {displayColumns.map(state => (
                      <td key={state} className="number-col">
                        {row[state] || '0.00'}
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

export default BudgetTableModal;
