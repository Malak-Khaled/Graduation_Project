import { Component } from 'react';
import BrandLogo from './BrandLogo';
import i18n from '../i18n';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-gray-50">
          <BrandLogo className="h-20 w-20 object-contain" />
          <h1 className="text-xl font-extrabold text-gray-800">{i18n.t('errorBoundary.title')}</h1>
          <p className="text-gray-500 text-sm text-center max-w-md">
            {i18n.t('errorBoundary.description')}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors"
          >
            {i18n.t('errorBoundary.reload')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
