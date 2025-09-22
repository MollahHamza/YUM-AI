import React from 'react';

function UnderConstruction({ pageName }) {
  return (
    <div className="construction-container">
      <div className="construction-content">
        <div className="construction-icon">🚧</div>
        <h1 className="construction-title">{pageName} Page</h1>
        <p className="construction-message">This page is currently under construction.</p>
        <p className="construction-submessage">We're working hard to bring you an amazing experience soon!</p>
      </div>
    </div>
  );
}

export default UnderConstruction;