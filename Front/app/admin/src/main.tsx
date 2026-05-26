import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "ui-shared/index.css";
import App from './App.tsx'

// Clear local storage from older typings to prevent crashes
if (!localStorage.getItem('v2_schema_migration')) {
    localStorage.clear();
    localStorage.setItem('v2_schema_migration', 'true');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
