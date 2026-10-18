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
      <div className="flex items-center justify-between bg-white p-3 rounded-md border border-[#DFE5E1] shadow-xs select-none">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'markdown'
                ? 'bg-teal-50 text-[#286A61] font-semibold border border-teal-200'
                : 'text-[#64716C] hover:text-[#17211F] hover:bg-[#F5F6F4]'
            }`}
          >
            <FileText size={14} className={activeTab === 'markdown' ? 'text-[#286A61]' : ''} />
            <span>PR Markdown Review Comment</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('sarif');
              handleLoadSarif();
            }}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'sarif'
                ? 'bg-teal-50 text-[#286A61] font-semibold border border-teal-200'
                : 'text-[#64716C] hover:text-[#17211F] hover:bg-[#F5F6F4]'
            }`}
          >
            <Code2 size={14} className={activeTab === 'sarif' ? 'text-[#286A61]' : ''} />
            <span>SARIF 2.1.0 (GitHub Code Scanning)</span>
          </button>
        </div>

        <div>
          {activeTab === 'markdown' ? (
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 text-xs font-medium text-[#17211F] bg-white hover:bg-[#F5F6F4] border border-[#DFE5E1] rounded flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              {copied ? <Check size={13} className="text-[#16794B]" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </button>
          ) : (
            <button
              onClick={handleDownloadSarif}
              disabled={!sarifData}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#286A61] hover:bg-[#1f544c] rounded flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <Download size={13} />
              <span>Download .SARIF</span>
            </button>
          )}
        </div>
      </div>

      {/* Output Viewer */}
      {activeTab === 'markdown' ? (
        <div className="bg-white rounded-md border border-[#DFE5E1] shadow-xs overflow-hidden">
          <pre className="text-xs font-mono text-[#17211F] whitespace-pre-wrap leading-relaxed overflow-x-auto p-5 bg-[#FBFBFA] max-h-[550px]">
            {analysis.markdown_report}
          </pre>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-[#DFE5E1] shadow-xs overflow-hidden">
          {loadingSarif ? (
            <div className="text-center py-12 text-xs font-mono text-[#64716C]">Generating SARIF 2.1.0 payload...</div>
          ) : (
            <pre className="text-xs font-mono text-[#17211F] whitespace-pre-wrap leading-relaxed overflow-x-auto p-5 bg-[#FBFBFA] max-h-[550px]">
              {sarifData}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
