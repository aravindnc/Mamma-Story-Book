import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <span
      className="spinner-border spinner-border-sm me-2"
      role="status"
      aria-hidden="true"
    ></span>
  );
};
