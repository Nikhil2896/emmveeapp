import React from 'react';
import AppNavigation from './source/navigation/AppNavigation';
import { AuthProvider } from './source/controller/AuthProvider';

const App = () => {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
};

export default App;
