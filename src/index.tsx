import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

localStorage.setItem("nodeMaxId", "0");
localStorage.setItem("edgeMaxId", "0");
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <App />
);
