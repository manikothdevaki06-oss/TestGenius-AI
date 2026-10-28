import React, { useState } from 'react';
import { X, Download, Copy, Check, FileJson, FileSpreadsheet, Terminal } from 'lucide-react';
import { TestCase, GeneratedScript } from '../types';
import {
  exportTestCasesToJson,
  exportTestCasesToCsv,
  downloadPythonScript,
  copyToClipboard,
} from '../utils/exporters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  testCases: TestCase[];
  latestScript: GeneratedScript | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  testCases,
  latestScript,
}) => {
  if (!isOpen) return null;

  const [format, setFormat] = useState<'json' | 'csv' | 'python'>('json');
  const [copied, setCopied] = useState(false);

  // Generate preview string
  let previewContent = '';
  if (format === 'json') {
    previewContent = JSON.stringify(testCases, null, 2);
  } else if (format === 'csv') {
    const headers = 'ID,Title,Category,Priority,Status,Objective,Expected Result\r\n';
    const rows = testCases
      .map(
        (tc) =>
          `"${tc.id}","${tc.title.replace(/"/g, '""')}","${tc.category}","${tc.priority}","${tc.status}","${tc.objective.replace(/"/g, '""')}","${tc.expectedResult.replace(/"/g, '""')}"`
      )
      .join('\r\n');
    previewContent = headers + rows;
  } else if (format === 'python') {
    previewContent = latestScript
      ? latestScript.pythonCode
      : '# No Playwright Python script has been generated yet.\n# Navigate to Script Generator to compile your test suite.';
  }

  const handleCopy = async () => {
    const ok = await copyToClipboard(previewContent);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (format === 'json') {
      exportTestCasesToJson(testCases);
    } else if (format === 'csv') {
      exportTestCasesToCsv(testCases);
    } else if (format === 'python' && latestScript) {
      downloadPythonScript(latestScript.pythonCode, `${latestScript.id.toLowerCase()}.py`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-sm text-slate-100">
              Export Suite & Automation Assets
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFormat('json')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                format === 'json'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>JSON ({testCases.length})</span>
            </button>

            <button
              onClick={() => setFormat('csv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                format === 'csv'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV Spreadsheet</span>
            </button>

            <button
              onClick={() => setFormat('python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                format === 'python'
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Playwright (.py)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-auto flex-1 max-h-[380px] leading-relaxed">
            <code>{previewContent}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
