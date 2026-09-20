import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ensureSeedData } from './data/seedInit.js';

// First launch: populate localStorage with demo data if empty.
ensureSeedData();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
