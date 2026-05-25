import React, { useState, useMemo, useEffect } from 'react';
import { PFM_DATA } from '../../../data/pfmData';
import ModernDropdown from '../../../shared/ui/ModernDropdown';
import './PfmTableModal.css';

const CATEGORIES = [
  "Total Cash Available",
  "Recurrent Expenditure",
  "Capital Expenditure",
  "Transfers"
];

const STATES = ["Kaduna", "Kano", "Jigawa", "Yobe", "Federal"];

const categoryIcons = {
  "Total Cash Available": "payments",
  "Recurrent Expenditure": "trending_up",
  "Capital Expenditure": "construction",
  "Transfers": "swap_horiz"
};

const categoryColors = {
  "Total Cash Available": "green",
  "Recurrent Expenditure": "teal",
  "Capital Expenditure": "gold",
  "Transfers": "indigo"
};

const PfmTableModal = ({ isOpen, onClose, initialCategory, initialState, initialYear = '2024' }) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "Total Cash Available");
  const [selectedState, setSelectedState] = useState(initialState || "Kaduna");
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  // Sync state when modal is opened with new props
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialState) setSelectedState(initialState);
    if (initialYear) setSelectedYear(initialYear);
  }, [initialCategory, initialState, initialYear, isOpen]);

  // Available years based on state
  const availableYears = useMemo(() => {
    if (!PFM_DATA[selectedState]) return [];
    return Object.keys(PFM_DATA[selectedState]).sort((a, b) => b - a); // descending
  }, [selectedState]);

  // Adjust year if active state doesn't have it
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [selectedState, availableYears, selectedYear]);

  const activeData = useMemo(() => {
    try {
      return PFM_DATA[selectedState]?.[selectedYear]?.[selectedCategory] || { original: 0, actual: 0, items: {} };
    } catch (e) {
      return { original: 0, actual: 0, items: {} };
    }
  }, [selectedCategory, selectedState, selectedYear]);

  // Toggle row expansion for nested breakdowns
  const toggleRow = (itemName) => {
    setExpandedRows(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '₦0.00';
    
    // If it's absolute zero
    if (val === 0) return '₦0.00';

    const absVal = Math.abs(val);
    let formatted = '';
    
    if (absVal >= 1e9) {
      formatted = `${(val / 1e9).toFixed(2)}B`;
    } else if (absVal >= 1e6) {
      formatted = `${(val / 1e6).toFixed(2)}M`;
    } else {
      formatted = val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return `₦${formatted}`;
  };

  // Helper to calculate performance percentage
  const calculatePerformance = (actual, original) => {
    if (!original || original === 0) {
      return actual > 0 ? '100%' : '0%';
    }
    const percent = (actual / original) * 100;
    return `${percent.toFixed(1)}%`;
  };

  // Helper to get performance class for badge styling
  const getPerformanceClass = (actual, original) => {
    if (!original || original === 0) return 'perf-neutral';
    const percent = (actual / original) * 100;
    if (percent >= 90) return 'perf-high';
    if (percent >= 60) return 'perf-medium';
    return 'perf-low';
  };

  // Process data rows
  const tableRows = useMemo(() => {
    const items = activeData.items || {};
    const rows = [];

    Object.entries(items).forEach(([name, details]) => {
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Check if item has breakdowns
      const breakdown = details.breakdown || {};
      const hasBreakdown = Object.keys(breakdown).length > 0;
      
      let matchesSubSearch = false;
      const subRows = [];

      if (hasBreakdown) {
        Object.entries(breakdown).forEach(([subName, subDetails]) => {
          const subMatches = subName.toLowerCase().includes(searchTerm.toLowerCase());
          if (subMatches) {
            matchesSubSearch = true;
          }
          if (searchTerm === '' || subMatches || matchesSearch) {
            subRows.push({
              name: subName,
              original: subDetails.original,
              actual: subDetails.actual,
              isSubRow: true
            });
          }
        });
      }

      if (searchTerm === '' || matchesSearch || matchesSubSearch) {
        rows.push({
          name,
          original: details.original,
          actual: details.actual,
          poverty_original: details.poverty_original,
          poverty_actual: details.poverty_actual,
          hasBreakdown,
          subRows
        });
      }
    });

    return rows;
  }, [activeData, searchTerm]);

  // Export current view to CSV
  const handleExport = () => {
    const csvRows = [];
    // Headers
    csvRows.push(["Classification / Item", "Original Budget (N)", "Actual (N)", "Variance (N)", "Performance (%)"]);
    
    // Add overall sum
    csvRows.push([
      `OVERALL TOTAL (${selectedCategory.toUpperCase()})`,
      activeData.original,
      activeData.actual,
      activeData.actual - activeData.original,
      calculatePerformance(activeData.actual, activeData.original)
    ]);
    csvRows.push([]);

    tableRows.forEach(row => {
      csvRows.push([
        row.name,
        row.original,
        row.actual,
        row.actual - row.original,
        calculatePerformance(row.actual, row.original)
      ]);
      
      if (row.hasBreakdown) {
        row.subRows.forEach(sub => {
          csvRows.push([
            `  - ${sub.name}`,
            sub.original,
            sub.actual,
            sub.actual - sub.original,
            calculatePerformance(sub.actual, sub.original)
          ]);
        });
      }
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.map(val => typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val).join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PFM_${selectedState}_${selectedCategory.replace(/\s+/g, '_')}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="pfm-modal-overlay" onClick={onClose}>
      <div className="pfm-modal-container" onClick={e => e.stopPropagation()}>
        
        {/* MODAL HEADER */}
        <div className={`pfm-modal-header border-${categoryColors[selectedCategory]}`}>
          <div className="header-left">
            <span className={`material-symbols-outlined theme-icon color-${categoryColors[selectedCategory]}`}>
              {categoryIcons[selectedCategory]}
            </span>
            <div>
              <h2>{selectedCategory} Breakdown</h2>
              <p>Detailed fiscal database analysis for {selectedState} ({selectedYear})</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn-premium export" onClick={handleExport} aria-label="Export Data to CSV">
              <span className="material-symbols-outlined">download</span>
              CSV
            </button>
            <button className="action-btn-premium print" onClick={() => window.print()} aria-label="Print Data Table">
              <span className="material-symbols-outlined">print</span>
              Print
            </button>
            <button className="close-circle-btn" onClick={onClose} aria-label="Close Modal">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="pfm-modal-filters">
          <div className="filter-grid">
            
            <div className="filter-item">
              <label>Budget Category</label>
              <ModernDropdown
                options={CATEGORIES}
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val);
                  setExpandedRows({});
                }}
              />
            </div>

            <div className="filter-item">
              <label>State / Entity</label>
              <ModernDropdown
                options={STATES}
                value={selectedState}
                onChange={(val) => {
                  setSelectedState(val);
                  setExpandedRows({});
                }}
              />
            </div>

            <div className="filter-item">
              <label>Fiscal Year</label>
              <ModernDropdown
                options={availableYears}
                value={selectedYear}
                onChange={setSelectedYear}
              />
            </div>

            <div className="filter-item search-box-wrap">
              <label>Search Classifications</label>
              <div className="search-input-wrapper">
                <span className="material-symbols-outlined">search</span>
                <input 
                  type="text" 
                  placeholder="Filter items..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* MODAL SUMMARY CARDS */}
        <div className="pfm-modal-summaries">
          <div className="summary-card total-budget">
            <span className="summary-label">Original Budget</span>
            <span className="summary-value">{formatCurrency(activeData.original)}</span>
          </div>
          <div className="summary-card total-actual">
            <span className="summary-label">Actual Expenditure</span>
            <span className="summary-value">{formatCurrency(activeData.actual)}</span>
          </div>
          <div className={`summary-card total-variance ${(activeData.actual - activeData.original) >= 0 ? 'pos' : 'neg'}`}>
            <span className="summary-label">Variance</span>
            <span className="summary-value">{formatCurrency(activeData.actual - activeData.original)}</span>
          </div>
          <div className="summary-card total-performance">
            <span className="summary-label">Performance Ratio</span>
            <div className="perf-badge-wrap">
              <span className={`perf-badge-premium ${getPerformanceClass(activeData.actual, activeData.original)}`}>
                {calculatePerformance(activeData.actual, activeData.original)}
              </span>
            </div>
          </div>
        </div>

        {/* MODAL BODY TABLE */}
        <div className="pfm-modal-body">
          <div className="table-responsive-wrap">
            <table className="pfm-data-table">
              <thead>
                <tr>
                  <th>Classification / Sector Item</th>
                  <th className="number-header">Original Budget</th>
                  <th className="number-header">Actual</th>
                  <th className="number-header">Variance</th>
                  <th className="center-header">Performance</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="no-data-cell">
                      <span className="material-symbols-outlined">search_off</span>
                      <p>No matching fiscal database records found</p>
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row, idx) => {
                    const isExpanded = !!expandedRows[row.name];
                    const variance = row.actual - row.original;
                    const performanceVal = calculatePerformance(row.actual, row.original);
                    const perfClass = getPerformanceClass(row.actual, row.original);

                    return (
                      <React.Fragment key={idx}>
                        <tr className={`main-data-row ${row.hasBreakdown ? 'expandable' : ''}`} onClick={() => row.hasBreakdown && toggleRow(row.name)}>
                          <td className="item-name-cell">
                            {row.hasBreakdown && (
                              <span className="material-symbols-outlined expand-icon">
                                {isExpanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
                              </span>
                            )}
                            <span className="name-text">{row.name}</span>
                            {row.poverty_original > 0 && (
                              <span className="poverty-tag" title="Includes Poverty-Focused Spend">Poverty Spend</span>
                            )}
                          </td>
                          <td className="number-cell font-numeric">{formatCurrency(row.original)}</td>
                          <td className="number-cell font-numeric">{formatCurrency(row.actual)}</td>
                          <td className={`number-cell font-numeric variance-cell ${variance >= 0 ? 'var-pos' : 'var-neg'}`}>
                            {formatCurrency(variance)}
                          </td>
                          <td className="center-cell">
                            <span className={`perf-badge-premium ${perfClass}`}>
                              {performanceVal}
                            </span>
                          </td>
                        </tr>

                        {/* RENDER EXPANDED SUB-ROWS */}
                        {row.hasBreakdown && isExpanded && row.subRows.map((subRow, subIdx) => {
                          const subVariance = subRow.actual - subRow.original;
                          const subPerfVal = calculatePerformance(subRow.actual, subRow.original);
                          const subPerfClass = getPerformanceClass(subRow.actual, subRow.original);

                          return (
                            <tr key={`sub-${subIdx}`} className="sub-data-row">
                              <td className="item-name-cell sub-indent">
                                <span className="name-text sub-text">{subRow.name}</span>
                              </td>
                              <td className="number-cell font-numeric sub-num">{formatCurrency(subRow.original)}</td>
                              <td className="number-cell font-numeric sub-num">{formatCurrency(subRow.actual)}</td>
                              <td className={`number-cell font-numeric variance-cell sub-num ${subVariance >= 0 ? 'var-pos' : 'var-neg'}`}>
                                {formatCurrency(subVariance)}
                              </td>
                              <td className="center-cell">
                                <span className={`perf-badge-premium ${subPerfClass} badge-small`}>
                                  {subPerfVal}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PfmTableModal;
