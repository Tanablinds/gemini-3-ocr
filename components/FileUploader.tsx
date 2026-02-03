
import React, { useRef } from 'react';

interface Props {
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<Props> = ({ onFileSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 mx-auto"
      >
        <i className="fas fa-plus"></i>
        Select Submission Image
      </button>
    </div>
  );
};

export default FileUploader;
