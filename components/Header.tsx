import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-bottom">
      <div className="container py-4">
        <h1 className="h2 fw-bold text-primary">
          Mummy Journey Storybook Maker
        </h1>
        <p className="text-muted mt-1 small">A gift of memories, crafted with love.</p>
      </div>
    </header>
  );
};
