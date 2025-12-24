import { useStore } from '../../store/useStore';
import type { AlgorithmType } from '../../types';
import { algorithmNames } from '../../algorithms/codes';
import './AlgorithmTabs.css';

const algorithms: AlgorithmType[] = ['sequential', 'divideConquer', 'priorityQueue'];

export function AlgorithmTabs() {
  const { algorithmType, setAlgorithmType } = useStore();

  return (
    <div className="algorithm-tabs">
      {algorithms.map((type) => (
        <button
          key={type}
          className={`tab-btn ${algorithmType === type ? 'active' : ''}`}
          onClick={() => setAlgorithmType(type)}
        >
          {algorithmNames[type]}
        </button>
      ))}
    </div>
  );
}
