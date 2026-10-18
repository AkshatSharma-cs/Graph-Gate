import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { fetchScanSarif } from '../api/client';
import { Download, Copy, Check, FileText, Code2 } from 'lucide-react';

interface CIReportViewProps {
  analysis: AnalysisResult;
}

export const CIReportView: React.FC<CIReportViewProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'sarif'>('markdown');
  const [copied, setCopied] = useState(false);
  const [sarifData, setSarifData] = useState<string | null>(null);
  const [loadingSarif, setLoadingSarif] = useState(false);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(analysis.markdown_report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSarif = async () => {
    if (sarifData) return;
    setLoadingSarif(true);
    try {
      const data = await fetchScanSarif(analysis.scan_id);
      setSarifData(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSarif(false);
    }
  };

  const handleDownloadSarif = () => {
    const blob = new Blob([sarifData || ''], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graphgate-scan-${analysis.scan_id}.sarif`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher & Actions */}
      <div className="flex items-center justify-between bg-surface-100 p-2.5 rounded border border-hairline shadow-subtle select-none">
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-3 py-1.5 rounded-xs transition-colors flex items-center gap-2 ${
              activeTab === 'markdown'
                ? 'bg-surface-200 text-ink font-semibold border border-hairline'
                : 'text-ink-muted hover:text-ink hover:bg-surface-200/50'
            }`}
          >
            <FileText size={12} className={activeTab === 'markdown' ? 'text-linear' : ''} />
            <span>PR Markdown Review Comment</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('sarif');
              handleLoadSarif();
            }}
            className={`px-3 py-1.5 rounded-xs transition-colors flex items-center gap-2 ${
              activeTab === 'sarif'
                ? 'bg-surface-200 text-ink font-semibold border border-hairline'
                : 'text-ink-muted hover:text-ink hover:bg-surface-200/50'
            }`}
          >
            <Code2 size={12} className={activeTab === 'sarif' ? 'text-linear' : ''} />
            <span>SARIF 2.1.0 (GitHub Code Scanning)</span>
          </button>
        </div>

        <div>
          {activeTab === 'markdown' ? (
            <button
              onClick={handleCopyMarkdown}
              className="px-2.5 py-1 text-xs font-mono text-ink bg-surface-200 hover:bg-surface-300 border border-hairline rounded-xs flex items-center gap-1.5 transition-colors shadow-subtle"
            >
              {copied ? <Check size={12} className="text-signal-green" /> : <Copy size={12} />}
              <span>{copied ? 'COPIED' : 'COPY MARKDOWN'}</span>
            </button>
          ) : (
            <button
              onClick={handleDownloadSarif}
              disabled={!sarifData}
              className="px-2.5 py-1 text-xs font-mono font-medium text-white bg-linear hover:bg-linear-hover rounded-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-subtle"
            >
              <Download size={12} />
              <span>DOWNLOAD .SARIF</span>
            </button>
          )}
        </div>
      </div>

      {/* Output Viewer */}
      {activeTab === 'markdown' ? (
        <div className="bg-surface-100 rounded border border-hairline shadow-subtle overflow-hidden">
          <pre className="text-xs font-mono text-ink-secondary whitespace-pre-wrap leading-relaxed overflow-x-auto p-5 bg-ground border-b border-hairline max-h-[550px]">
            {analysis.markdown_report}
          </pre>
        </div>
      ) : (
        <div className="bg-surface-100 rounded border border-hairline shadow-subtle overflow-hidden">
          {loadingSarif ? (
            <div className="text-center py-12 text-xs font-mono text-ink-muted">Generating SARIF 2.1.0 payload...</div>
          ) : (
            <pre className="text-xs font-mono text-ink-secondary whitespace-pre-wrap leading-relaxed overflow-x-auto p-5 bg-ground max-h-[550px]">
              {sarifData}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
