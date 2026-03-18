// components/TableSkeleton.jsx
import React from "react";

const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i}>
                <div 
                  className="skeleton-loader" 
                  style={{ height: "20px", width: `${60 + Math.random() * 40}%` }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(columns)].map((_, colIndex) => (
                <td key={colIndex}>
                  <div 
                    className="skeleton-loader" 
                    style={{ 
                      height: "18px", 
                      width: `${40 + Math.random() * 50}%` 
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;