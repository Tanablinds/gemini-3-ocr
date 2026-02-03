
import React, { useState, useEffect } from 'react';
import { processHandwritingImage } from './services/geminiService';
import { OcrResult, AppState, ReferenceItem } from './types';
import FileUploader from './components/FileUploader';
import OcrResultView from './components/OcrResultView';
import MetricsDashboard from './components/MetricsDashboard';
import HistorySidebar from './components/HistorySidebar';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentResult: null,
    history: [],
    isLoading: false,
    error: null,
    referenceData: [],
  });

  const [activeTab, setActiveTab] = useState<'ocr' | 'eval'>('ocr');

  // Load reference data on mount
  useEffect(() => {
    const loadReference = async () => {
      try {
        const response = await fetch('./reference.json');
        if (response.ok) {
          const data = await response.json();
          setState(prev => ({ ...prev, referenceData: data }));
        }
      } catch (err) {
        console.error("Failed to load reference.json", err);
      }
    };
    loadReference();
  }, []);

  const handleFileSelect = async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const responses = await processHandwritingImage(base64);
        
        const newResult: OcrResult = {
          id: crypto.randomUUID(),
          fileName: file.name,
          imageUrl: reader.result as string,
          responses,
          timestamp: Date.now(),
        };

        setState(prev => ({
          ...prev,
          currentResult: newResult,
          history: [newResult, ...prev.history],
          isLoading: false,
        }));
      };
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message || 'Unknown error' }));
    }
  };

  const selectFromHistory = (result: OcrResult) => {
    setState(prev => ({ ...prev, currentResult: result }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <HistorySidebar 
        history={state.history} 
        onSelect={selectFromHistory} 
        currentId={state.currentResult?.id} 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-file-signature text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-800">Exam OCR & Evaluator</h1>
          </div>
          
          <nav className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('ocr')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'ocr' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Extraction
            </button>
            <button 
              onClick={() => setActiveTab('eval')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'eval' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Evaluation Metrics
            </button>
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {state.error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
                  <p className="text-red-700 font-medium">{state.error}</p>
                </div>
              </div>
            )}

            {!state.currentResult && !state.isLoading && (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300">
                <i className="fas fa-cloud-upload-alt text-6xl text-slate-300 mb-6"></i>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to scan submissions</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">Upload handwritten student responses to automatically segment questions and extract text while preserving original artifacts.</p>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
            )}

            {state.isLoading && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h2 className="text-xl font-semibold text-slate-800">Processing handwriting...</h2>
                <p className="text-slate-500">Gemini is analyzing layout and handwriting nuances.</p>
              </div>
            )}

            {state.currentResult && !state.isLoading && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'ocr' ? (
                  <OcrResultView result={state.currentResult} onNewScan={() => setState(p => ({ ...p, currentResult: null }))} />
                ) : (
                  <MetricsDashboard result={state.currentResult} referenceData={state.referenceData} />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
