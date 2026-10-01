import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<Provider>('google');
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({
    anthropic: false,
    google: false,
  });
  const { components, isLoading, error, generate, removeComponent, clearAll } =
    useComponentGenerator();

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setEnvKeys(data.envKeys))
      .catch(() => {});
  }, []);

  const hasEnvKey = envKeys[provider];

  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해주세요.`);
      return;
    }
    generate(prompt, apiKey || undefined, provider);
  };

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    setApiKey('');
  };

  const activeProvider = PROVIDER_CONFIG[provider].label;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">React 컴포넌트 생성기</span>
        </div>
        <div className="topbar-meta">
          <span className="meta-item">
            <i className={`dot ${hasEnvKey ? 'dot--ok' : ''}`} aria-hidden="true" />
            {activeProvider}
          </span>
          <span className="meta-item">컴포넌트 {components.length}개</span>
        </div>
      </header>

      <section className="hero">
        <h1>말로 설명하면 UI가 됩니다</h1>
        <p>만들고 싶은 화면을 적으면 React 컴포넌트로 생성해, 바로 미리 보고 코드를 복사할 수 있어요.</p>
      </section>

      <main className="workspace">
        <section
          className={`console ${isLoading ? 'console--scanning' : ''}`}
          aria-label="컴포넌트 생성"
        >
          <span className="console-frame" aria-hidden="true" />
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
        </section>

        <aside className="settings" aria-label="실행 설정">
          <h2>실행 설정</h2>
          <div className="field">
            <span className="field-label" id="provider-label">Provider</span>
            <div className="segmented" role="group" aria-labelledby="provider-label">
              {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => (
                <button
                  key={key}
                  type="button"
                  className="segment"
                  aria-pressed={provider === key}
                  onClick={() => handleProviderChange(key as Provider)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="api-key">API Key</label>
            <div className="api-key-field">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  hasEnvKey
                    ? '서버 키 사용 중 (입력 시 덮어씀)'
                    : PROVIDER_CONFIG[provider].placeholder
                }
              />
              <button
                className="btn-toggle-key"
                onClick={() => setShowKey(!showKey)}
                type="button"
              >
                {showKey ? '숨기기' : '보기'}
              </button>
            </div>
            <p className={`key-status ${hasEnvKey ? 'key-status--ready' : ''}`}>
              <i className="dot" aria-hidden="true" />
              {hasEnvKey ? '.env 키가 연결되어 있습니다.' : '직접 입력하거나 서버 환경변수를 설정하세요.'}
            </p>
          </div>
        </aside>
      </main>

      {error && (
        <div className="error-banner" role="alert">
          <p>{error}</p>
        </div>
      )}

      <section className="results-section">
        {components.length > 0 && (
          <div className="results-header">
            <h2>생성된 컴포넌트 {components.length}개</h2>
            <button className="btn-clear" onClick={clearAll}>
              전체 삭제
            </button>
          </div>
        )}

        {components.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="orbit" aria-hidden="true">
              <span /><span /><span />
            </div>
            <div className="empty-copy">
              <h2>아직 만든 컴포넌트가 없어요</h2>
              <ol>
                <li>만들고 싶은 UI를 위 입력창에 적습니다.</li>
                <li>생성 버튼을 누릅니다.</li>
                <li>미리보기를 확인하고 코드를 복사합니다.</li>
              </ol>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="loading-card" role="status">
            <p>컴포넌트를 생성하고 있습니다...</p>
            <div className="loading-pulse" />
          </div>
        )}

        <div className="results-grid">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onRemove={removeComponent}
              onRegenerate={handleGenerate}
              isLoading={isLoading}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
