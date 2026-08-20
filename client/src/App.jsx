import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<div>Home placeholder</div>} />
      </Routes>
    </ToastProvider>
  );
}
