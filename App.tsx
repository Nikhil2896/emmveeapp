import React, { useEffect } from 'react';
import AppNavigation from './source/navigation/AppNavigation';
import { AuthProvider } from './source/controller/AuthProvider';
import { requestNotificationPermission } from './source/controller/Permissions';

const App = () => {
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
};

export default App;
