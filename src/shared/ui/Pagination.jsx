import React, { useState } from 'react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage = 7,
  onItemsPerPageChange,
  pageSizeOptions = [7, 10, 15, 20],
}) => {
  const [showSizeMenu, setShowSizeMenu] = useState(false);

  if (totalPages <= 1) return null;

  // Build the visible page list with ellipsis
  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    // Always show first 5 pages, ellipsis, last page
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const pages = getPages();

  return (
    <div className="pagination-container">
      {/* Left: Page info */}
      <span className="pagination-info">Page {currentPage} of {totalPages}</span>

      {/* Center: Navigation */}
      <div className="pagination-nav">
        {/* First page */}
        <button 
          className="pagination-btn" 
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First page"
        >
          <i className="ri-arrow-left-double-line"></i>
        </button>

        {/* Prev */}
        <button 
          className="pagination-btn" 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous page"
        >
          <i className="ri-arrow-left-s-line"></i>
        </button>

        {/* Page numbers */}
        <div className="pagination-numbers">
          {pages.map((page, i) =>
            page === '...' ? (
              <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
            ) : (
              <button
                key={page}
                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button 
          className="pagination-btn" 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next page"
        >
          <i className="ri-arrow-right-s-line"></i>
        </button>

        {/* Last page */}
        <button 
          className="pagination-btn" 
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Last page"
        >
          <i className="ri-arrow-right-double-line"></i>
        </button>
      </div>

      {/* Right: Items per page (only if callback provided) */}
      {onItemsPerPageChange && (
        <div className="pagination-size-selector">
          <button
            className="pagination-size-btn"
            onClick={() => setShowSizeMenu(s => !s)}
          >
            <span>{itemsPerPage} / page</span>
            <i className="ri-arrow-down-s-line"></i>
          </button>
          {showSizeMenu && (
            <div className="pagination-size-menu">
              {pageSizeOptions.map(size => (
                <button
                  key={size}
                  className={`pagination-size-option ${itemsPerPage === size ? 'active' : ''}`}
                  onClick={() => {
                    onItemsPerPageChange(size);
                    setShowSizeMenu(false);
                    onPageChange(1);
                  }}
                >
                  {size} / page
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Pagination;
