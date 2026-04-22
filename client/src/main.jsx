import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Bounce, ToastContainer } from 'react-toastify';

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <ToastContainer
      position="top-right"
      autoClose={1500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Bounce}
    />
  </>
)
