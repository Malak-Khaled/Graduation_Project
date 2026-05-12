import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { store } from './app/store';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRouter from './routes/AppRouter';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
        <Provider store={store}>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </Provider>
      </ErrorBoundary>
    </I18nextProvider>
  </React.StrictMode>
);