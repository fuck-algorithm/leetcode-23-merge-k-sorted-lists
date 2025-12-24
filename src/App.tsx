import { useEffect } from 'react';
import { Header } from './components/Header';
import { DataInput } from './components/DataInput';
import { AlgorithmTabs } from './components/AlgorithmTabs';
import { CodePanel } from './components/CodePanel';
import { Canvas } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { FloatingBall } from './components/FloatingBall';
import { useStore } from './store/useStore';
import './App.css';

function App() {
  const initFromStorage = useStore((state) => state.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return (
    <div className="app">
      <Header />
      <DataInput />
      <AlgorithmTabs />
      
      <div className="main-content">
        <div className="code-section">
          <CodePanel />
        </div>
        <div className="canvas-section">
          <Canvas />
        </div>
      </div>
      
      <ControlPanel />
      <FloatingBall />
    </div>
  );
}

export default App;
