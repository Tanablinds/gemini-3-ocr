
import React from 'react';
import { OcrResult } from '../types';

interface Props {
  history: OcrResult[];
  onSelect: (result: OcrResult) => void;
  currentId?: string;
}

const HistorySidebar: React.FC<Props> = ({ history, onSelect, currentId }) => {
  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-slate-200">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <i className="fas fa-history text-slate-400"></i>
          Submission History
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {history.length === 0 ? (
          <div className="text-center py-10 opacity-40">
            <p className="text-sm">No scans yet</p>
          </div>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`w-full text-left p-3 rounded-xl transition-all ${
                currentId === item.id 
                  ? 'bg-indigo-50 border-indigo-100 border' 
                  : 'hover:bg-slate-50 border-transparent border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                  <img src={item.imageUrl} alt="Thumb" className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{item.fileName}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-indigo-600/5 rounded-lg p-3">
          <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">OCR Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-slate-600">Gemini 3 Flash Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default HistorySidebar;
