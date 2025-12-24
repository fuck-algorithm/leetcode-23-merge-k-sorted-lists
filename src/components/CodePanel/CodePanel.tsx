import { useStore } from '../../store/useStore';
import type { CodeLanguage } from '../../types';
import { algorithmCodes } from '../../algorithms/codes';
import { Highlight, themes } from 'prism-react-renderer';
import './CodePanel.css';

const languages: { key: CodeLanguage; label: string }[] = [
  { key: 'java', label: 'Java' },
  { key: 'python', label: 'Python' },
  { key: 'golang', label: 'Go' },
  { key: 'javascript', label: 'JavaScript' },
];

const prismLanguageMap: Record<CodeLanguage, string> = {
  java: 'java',
  python: 'python',
  golang: 'go',
  javascript: 'javascript',
};

export function CodePanel() {
  const { algorithmType, codeLanguage, setCodeLanguage, steps, playback } = useStore();
  
  const code = algorithmCodes[algorithmType][codeLanguage];
  const currentStep = steps[playback.currentStep];
  const highlightedLines = currentStep?.highlightedLines[codeLanguage] || [];
  const variables = currentStep?.variables || {};

  return (
    <div className="code-panel">
      <div className="code-header">
        <div className="language-tabs">
          {languages.map((lang) => (
            <button
              key={lang.key}
              className={`lang-btn ${codeLanguage === lang.key ? 'active' : ''}`}
              onClick={() => setCodeLanguage(lang.key)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="code-content">
        <Highlight
          theme={themes.nightOwl}
          code={code}
          language={prismLanguageMap[codeLanguage]}
        >
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre className="code-pre" style={{ ...style, background: 'transparent' }}>
              {tokens.map((line, lineIndex) => {
                const lineNumber = lineIndex + 1;
                const isHighlighted = highlightedLines.includes(lineNumber);
                const lineVariables = getLineVariables(lineNumber, variables, code);
                
                return (
                  <div
                    key={lineIndex}
                    {...getLineProps({ line })}
                    className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
                  >
                    <span className="line-number">{lineNumber}</span>
                    <span className="line-content">
                      {line.map((token, tokenIndex) => (
                        <span key={tokenIndex} {...getTokenProps({ token })} />
                      ))}
                    </span>
                    {lineVariables && (
                      <span className="line-variables">{lineVariables}</span>
                    )}
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
      
      {Object.keys(variables).length > 0 && (
        <div className="variables-panel">
          <div className="variables-title">变量状态</div>
          <div className="variables-list">
            {Object.entries(variables).map(([key, value]) => (
              <div key={key} className="variable-item">
                <span className="variable-name">{key}</span>
                <span className="variable-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 获取行内变量显示
function getLineVariables(
  lineNumber: number,
  variables: Record<string, string>,
  code: string
): string | null {
  const lines = code.split('\n');
  const line = lines[lineNumber - 1] || '';
  
  // 简单匹配：如果变量名出现在当前行，显示其值
  const matchedVars: string[] = [];
  
  for (const [varName, varValue] of Object.entries(variables)) {
    // 检查变量名是否在当前行（简单匹配）
    const simpleVarName = varName.split('.')[0];
    if (line.includes(simpleVarName) && !varName.includes('.')) {
      matchedVars.push(`${varName}=${varValue}`);
    }
  }
  
  return matchedVars.length > 0 ? `// ${matchedVars.join(', ')}` : null;
}
