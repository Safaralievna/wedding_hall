import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { router } from '@/routes';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass !bg-surface-800 !text-white !border !border-white/10',
          duration: 4000,
        }}
      />
    </AuthProvider>
  );
}

export default App;
