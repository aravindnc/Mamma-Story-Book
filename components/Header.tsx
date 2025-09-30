import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md border-b-2 border-pink-100">
      <div className="container mx-auto px-4 py-4 md:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-pink-800 tracking-tight">
          Mummy Journey Storybook Maker
        </h1>
        <p className="text-sm text-gray-500 mt-1">A gift of memories, crafted with love.</p>
      </div>
    </header>
  );
};
