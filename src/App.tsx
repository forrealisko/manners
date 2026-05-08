/* ═══════════════════════════════════════════════════════
   MANNERS — Main App
   ═══════════════════════════════════════════════════════ */

import { useCallback, useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import Header from './components/Header/Header';
import ProductGrid from './components/ProductGrid/ProductGrid';
import ProductDetail from './components/ProductDetail/ProductDetail';
import './styles/index.css';
import './styles/glass.css';
import './styles/animations.css';

export default function App() {
  const { isLoading, setLoading, selectedProductId, theme } = useAppStore();

  // Apply theme on mount (in case Zustand rehydration doesn't fire)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLoadComplete = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <>
      {/* Loading Screen — X expand animation */}
      {isLoading && <LoadingScreen onComplete={handleLoadComplete} />}

      {/* Main App */}
      <div
        className="app"
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }}
      >
        <Header />
        <main>
          <ProductGrid />
        </main>
      </div>

      {/* Product Detail Overlay */}
      {selectedProductId && <ProductDetail />}
    </>
  );
}
