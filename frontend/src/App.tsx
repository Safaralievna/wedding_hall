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
          className: '!bg-white !text-gray-800 !border !border-border !shadow-lg',
          duration: 4000,
        }}
      />
    </AuthProvider>
  );
}

export default App;
