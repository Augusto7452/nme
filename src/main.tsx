import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registrarServiceWorker } from './pwaRegister';

registrarServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);
