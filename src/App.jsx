import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AppRoutes from './routes/AppRoutes';
import Preloader from './components/Preloader';

function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        {initialLoading && <Preloader message="Initializing Kevalon Enterprise CRM..." />}
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
