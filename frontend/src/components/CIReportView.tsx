import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { fetchScanSarif } from '../api/client';
import { FileText, Download, Copy, Check, Terminal, Shield } from 'lucide-react';

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
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-border shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'markdown'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-ink hover:bg-slate-100'
            }`}
          >
            Pull Request Markdown Summary
          </button>
          <button
            onClick={() => {
              setActiveTab('sarif');
              handleLoadSarif();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sarif'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-ink hover:bg-slate-100'
            }`}
          >
            SARIF 2.1.0 (GitHub Code Scanning)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'markdown' ? (
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={13} className="text-success-600" /> : <Copy size={13} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
            </button>
          ) : (
            <button
              onClick={handleDownloadSarif}
              disabled={!sarifData}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Download size={13} />
              <span>Download .sarif</span>
            </button>
          )}
        </div>
      </div>

      {/* Content panel */}
      {activeTab === 'markdown' ? (
        <div className="bg-white p-6 rounded-xl border border-border shadow-xs">
          <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto bg-slate-50 p-5 rounded-lg border border-border">
            {analysis.markdown_report}
          </pre>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-border shadow-xs">
          {loadingSarif ? (
            <div className="text-center py-10 text-xs text-slate-500">Loading SARIF document...</div>
          ) : (
            <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto bg-slate-900 text-slate-100 p-5 rounded-lg max-h-[550px]">
              {sarifData}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
