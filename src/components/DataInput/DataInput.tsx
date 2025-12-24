import { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { validateInput, generateRandomData, presetExamples } from '../../utils/validation';
import './DataInput.css';

export function DataInput() {
  const { inputText, setInputText, setInputLists } = useStore();
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);
    setError(null);
  }, [setInputText]);

  const handleApply = useCallback(() => {
    const result = validateInput(inputText);
    if (result.isValid) {
      setInputLists(result.lists);
      setError(null);
    } else {
      setError(result.errorMessage || '输入格式错误');
    }
  }, [inputText, setInputLists]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  }, [handleApply]);

  const handlePresetClick = useCallback((data: number[][]) => {
    const text = JSON.stringify(data);
    setInputText(text);
    setInputLists(data);
    setError(null);
  }, [setInputText, setInputLists]);

  const handleRandomClick = useCallback(() => {
    const data = generateRandomData();
    const text = JSON.stringify(data);
    setInputText(text);
    setInputLists(data);
    setError(null);
  }, [setInputText, setInputLists]);

  return (
    <div className="data-input">
      <div className="input-row">
        <label className="input-label">输入数据：</label>
        <input
          type="text"
          className={`input-field ${error ? 'input-error' : ''}`}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="例如：[[1,4,5],[1,3,4],[2,6]]"
        />
        <button className="apply-btn" onClick={handleApply}>
          应用
        </button>
        <button className="random-btn" onClick={handleRandomClick}>
          随机生成
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="presets-row">
        <span className="presets-label">预设样例：</span>
        {presetExamples.map((example, index) => (
          <button
            key={index}
            className="preset-btn"
            onClick={() => handlePresetClick(example.data)}
          >
            {example.name}
          </button>
        ))}
      </div>
    </div>
  );
}
