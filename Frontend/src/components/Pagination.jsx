// components/Pagination.jsx
import React, { memo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Pagination = memo(({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  loading = false,
  pageSize = 20
}) => {
  // Don't render if only one page
  if (totalPages <= 1) return null;

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 0 && page < totalPages && !loading) {
      onPageChange(page);
    }
  };

  return (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4">
      {/* Info */}
      <div className="text-muted small">
        Showing <strong>{totalItems > 0 ? startItem : 0}</strong> to{" "}
        <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
      </div>

      {/* Pagination Controls */}
      <nav aria-label="Pagination">
        <ul className="pagination pagination-sm mb-0">
          {/* First Page */}
          <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageClick(0)}
              disabled={currentPage === 0 || loading}
              aria-label="First page"
              title="First page"
            >
              <ChevronsLeft size={16} />
            </button>
          </li>

          {/* Previous Page */}
          <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 0 || loading}
              aria-label="Previous page"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
          </li>

          {/* Page Numbers */}
          {getPageNumbers().map((pageNum) => (
            <li
              key={pageNum}
              className={`page-item ${pageNum === currentPage ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => handlePageClick(pageNum)}
                disabled={loading}
                aria-label={`Page ${pageNum + 1}`}
                aria-current={pageNum === currentPage ? "page" : undefined}
              >
                {pageNum + 1}
              </button>
            </li>
          ))}

          {/* Next Page */}
          <li className={`page-item ${currentPage >= totalPages - 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || loading}
              aria-label="Next page"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </li>

          {/* Last Page */}
          <li className={`page-item ${currentPage >= totalPages - 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageClick(totalPages - 1)}
              disabled={currentPage >= totalPages - 1 || loading}
              aria-label="Last page"
              title="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
});

Pagination.displayName = "Pagination";

export default Pagination;