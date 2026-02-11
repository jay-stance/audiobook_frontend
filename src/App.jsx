import React from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Reader from './pages/Reader';
import Stats from './pages/Stats';
import MiniPlayer from './components/MiniPlayer';
import useTTS from './hooks/useTTS';
import useStore from './store/useStore';

export default function App() {
  const { activeView } = useStore();
  const tts = useTTS();

  const renderView = () => {
    switch (activeView) {
      case 'reader':
        return <Reader />;
      case 'stats':
        return <Stats />;
      case 'home':
      default:
        return <Home />;
    }
  };

  return (
    <Layout>
      {renderView()}
      {activeView !== 'reader' && <MiniPlayer tts={tts} />}
    </Layout>
  );
}
