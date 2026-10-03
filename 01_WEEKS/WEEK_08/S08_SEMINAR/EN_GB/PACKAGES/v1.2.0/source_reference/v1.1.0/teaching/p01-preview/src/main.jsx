import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { createUniqueIdFactory, scopedStorage } from './identity.mjs';
import { initialItems } from './shared-fixture.mjs';
import './styles.css';
const node = document.querySelector('#root');
try {
  const writes = [];
  const storage = scopedStorage(localStorage, 'tw2026-s08-p01-react', writes);
  const createItemId = createUniqueIdFactory(storage, initialItems);
  window.S08Preview = { kind:'TEACHING_PREVIEW_NOT_CANONICAL_ENTRY', writes,
    stored:()=>storage.getItem('reading-queue'),
    resetFixture:()=>{if(confirm('Remove only the S08 React preview store?')){localStorage.removeItem('tw2026-s08-p01-react');location.reload();}}
  };
  createRoot(node).render(<StrictMode><App storage={storage} initialItems={initialItems} createItemId={createItemId}/></StrictMode>);
} catch (error) {
  node.textContent = 'PREVIEW BLOCKED: ' + error.message + '. No persistence or React result is claimed.';
}
