
import React, { useState, useEffect, useMemo } from 'react';
import { OcrResult, ReferenceItem } from '../types';
import { calculateCER, calculateWER } from '../utils/metrics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  result: OcrResult;
  referenceData: ReferenceItem[];
}

const MetricsDashboard: React.FC<Props> = ({ result, referenceData }) => {
  // Find reference for the current document
  const matchingReference = useMemo(() => {
    return referenceData.find(ref => ref.doc_id === result.fileName);
  }, [referenceData, result.fileName]);

  const [groundTruths, setGroundTruths] = useState<Record<string, string>>({});
  const [metrics, setMetrics] = useState<{question: string, cer: number, wer: number}[]>([]);

  // Initialize ground truth from reference data if it's found
  useEffect(() => {
    if (matchingReference) {
      if (matchingReference.question_id === null) {
        // If doc-level reference, we assign it to the first question or combined
        // For this UI, we'll try to map it to a "Document Level" metric
        setGroundTruths({ "Document": matchingReference.reference_text });
      } else {
        // If question-specific reference
        setGroundTruths(prev => ({ 
          ...prev, 
          [matchingReference.question_id || "Unknown"]: matchingReference.reference_text 
        }));
      }
    } else {
      setGroundTruths({});
    }
  }, [matchingReference, result.id]);

  useEffect(() => {
    // If we have a doc-level reference (null question_id), we compare the JOINED text
    if (matchingReference && matchingReference.question_id === null) {
      const fullOcrText = result.responses.map(r => r.originalText).join(' ');
      const gt = groundTruths["Document"] || '';
      setMetrics([{
        question: "Document",
        cer: gt ? calculateCER(gt, fullOcrText) * 100 : 0,
        wer: gt ? calculateWER(gt, fullOcrText) * 100 : 0
      }]);
    } else {
      // Otherwise, keep the existing per-question logic
      const newMetrics = result.responses.map(resp => {
        const gt = groundTruths[resp.questionNumber] || '';
        return {
          question: resp.questionNumber,
          cer: gt ? calculateCER(gt, resp.originalText) * 100 : 0,
          wer: gt ? calculateWER(gt, resp.originalText) * 100 : 0
        };
      });
      setMetrics(newMetrics);
    }
  }, [groundTruths, result.responses, matchingReference]);

  const activeMetrics = metrics.filter(m => groundTruths[m.question]);
  const avgCer = activeMetrics.length > 0 
    ? activeMetrics.reduce((acc, m) => acc + m.cer, 0) / activeMetrics.length 
    : 0;
  const avgWer = activeMetrics.length > 0 
    ? activeMetrics.reduce((acc, m) => acc + m.wer, 0) / activeMetrics.length 
    : 0;

  const handleGtChange = (qNum: string, text: string) => {
    setGroundTruths(prev => ({ ...prev, [qNum]: text }));
  };

  if (!matchingReference && Object.keys(groundTruths).length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <i className="fas fa-search text-3xl"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Reference Found</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          The file <span className="font-mono bg-slate-100 px-1 rounded">"{result.fileName}"</span> was not found in <span className="font-mono">reference.json</span>. 
          Evaluation metrics cannot be calculated automatically.
        </p>
        <div className="pt-4">
          <button 
            onClick={() => setGroundTruths({ "Manual": "" })}
            className="text-indigo-600 font-bold hover:underline"
          >
            Enter Ground Truth Manually?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {matchingReference && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <i className="fas fa-link"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-700 uppercase">Auto-Matched Reference</p>
              <p className="text-sm text-indigo-900 font-medium">Found ground truth for <span className="font-bold underline">{result.fileName}</span></p>
            </div>
          </div>
          <div className="text-[10px] bg-white px-2 py-1 rounded-full border border-indigo-100 font-mono text-indigo-400">
            ID: {result.fileName}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Ground Truth Input */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fas fa-keyboard text-indigo-500"></i>
            Ground Truth Setup
          </h3>
          <p className="text-sm text-slate-500 mb-6">Verify the expected text below.</p>
          
          <div className="space-y-6">
            {Object.keys(groundTruths).map((key, i) => (
              <div key={i} className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{key}</label>
                <textarea 
                  className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  placeholder="Type the ground truth text here..."
                  value={groundTruths[key] || ''}
                  onChange={(e) => handleGtChange(key, e.target.value)}
                />
              </div>
            ))}
            
            {!matchingReference && (
              <p className="text-[10px] text-slate-400 italic">
                Note: No automatic match was found in reference.json. Metrics are based on manual input.
              </p>
            )}
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center group hover:border-indigo-200 transition-colors">
              <span className="text-xs font-bold text-slate-400 uppercase">Avg CER</span>
              <div className="text-3xl font-black text-indigo-600 mt-1">{avgCer.toFixed(1)}%</div>
              <p className="text-[10px] text-slate-400 mt-2">Character Error Rate</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center group hover:border-indigo-200 transition-colors">
              <span className="text-xs font-bold text-slate-400 uppercase">Avg WER</span>
              <div className="text-3xl font-black text-indigo-600 mt-1">{avgWer.toFixed(1)}%</div>
              <p className="text-[10px] text-slate-400 mt-2">Word Error Rate</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[300px]">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Error Rate Performance (%)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="question" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(79, 70, 229, 0.05)'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="cer" name="CER %" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="wer" name="WER %" fill="#a5b4fc" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Comparison Logic</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {matchingReference && matchingReference.question_id === null 
                ? "Full-page comparison: All extracted question segments are concatenated and compared against the document-level reference text provided in the repository."
                : "Segmented comparison: Each detected question block is evaluated against its respective reference text entry."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
