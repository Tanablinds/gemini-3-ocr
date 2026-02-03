
import React from 'react';
import { OcrResult } from '../types';

interface Props {
  result: OcrResult;
  onNewScan: () => void;
}

const OcrResultView: React.FC<Props> = ({ result, onNewScan }) => {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Image Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-8 h-fit">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-image text-indigo-500"></i>
            Original Submission
          </h3>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">{result.fileName}</span>
        </div>
        <div className="rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
          <img src={result.imageUrl} alt="Submission" className="w-full object-contain max-h-[70vh]" />
        </div>
      </div>

      {/* Extraction Panel */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-file-alt text-indigo-500"></i>
              Extracted Questions
            </h3>
            <button 
              onClick={onNewScan}
              className="text-sm text-indigo-600 font-medium hover:underline"
            >
              New Scan
            </button>
          </div>

          <div className="space-y-6">
            {result.responses.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <i className="fas fa-ghost text-4xl mb-4"></i>
                <p>No text detected in segments.</p>
              </div>
            ) : (
              result.responses.map((resp, idx) => (
                <div key={idx} className="group border-l-4 border-indigo-500 pl-4 py-1 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{resp.questionNumber}</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-1 rounded ${i < Math.round(resp.confidence * 5) ? 'bg-indigo-400' : 'bg-slate-200'}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                    {resp.originalText}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
              <i className="fas fa-check-circle"></i>
              Spelling Preserved
            </div>
            <p className="text-xs text-emerald-600">Verbatim extraction ignores auto-correction.</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-1">
              <i className="fas fa-minus-circle"></i>
              Cancellations Ignored
            </div>
            <p className="text-xs text-amber-600">Crossed-out text was successfully filtered.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OcrResultView;
