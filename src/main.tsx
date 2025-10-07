import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// تحديث التطبيق - نظام الطلبات تم إزالته بالكامل
createRoot(document.getElementById("root")!).render(<App />);
