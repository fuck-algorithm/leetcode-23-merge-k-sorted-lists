import { useEffect, useState } from 'react';
import { getGitHubStars, getGitHubUrl } from '../../utils/github';
import { algorithmNames } from '../../algorithms/codes';
import { useStore } from '../../store/useStore';
import { AlgorithmModal } from '../AlgorithmModal';
import './Header.css';

export function Header() {
  const [stars, setStars] = useState<number>(0);
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(false);
  const algorithmType = useStore((state) => state.algorithmType);

  useEffect(() => {
    getGitHubStars().then(setStars);
  }, []);

  const leetcodeUrl = 'https://leetcode.cn/problems/merge-k-sorted-lists/';
  const hotListUrl = 'https://fuck-algorithm.github.io/leetcode-hot-100/';
  const githubUrl = getGitHubUrl();

  return (
    <header className="header">
      <div className="header-left">
        <a
          href={hotListUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="back-link"
        >
          ← 返回 Leetcode Hot 100
        </a>
      </div>

      <div className="header-center">
        <a
          href={leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="title-link"
        >
          <h1 className="title">23. 合并 K 个升序链表</h1>
        </a>
      </div>

      <div className="header-right">
        <button
          className="algorithm-info-btn"
          onClick={() => setShowAlgorithmInfo(true)}
          title="查看算法思路"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          算法思路
        </button>

        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
          title="去 GitHub 仓库 Star 支持一下"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span className="star-count">⭐ {stars}</span>
        </a>
      </div>

      {showAlgorithmInfo && (
        <AlgorithmModal
          algorithmType={algorithmType}
          algorithmName={algorithmNames[algorithmType]}
          onClose={() => setShowAlgorithmInfo(false)}
        />
      )}
    </header>
  );
}
