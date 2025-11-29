import React, { useState, useRef, useCallback } from 'react';
import { DocFile, ProcessingStatus, FormattedProfile } from './types';
import { extractTextFromDocx } from './services/fileService';
import { processProfileWithGemini } from './services/geminiService';
import { generateAndDownloadDocx } from './services/exportService';
import { ProfileRenderer } from './components/ProfileRenderer';
import { v4 as uuidv4 } from 'uuid'; // Since I cannot import external libraries I will write a simple ID generator helper below
// We'll replace uuidv4 with a simple helper since we can't install packages freely in this strict generation mode
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function App() {
  const [files, setFiles] = useState<DocFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles).filter(f => 
      f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    if (fileArray.length === 0) {
      alert("Please upload .docx files only.");
      return;
    }

    const newDocFiles: DocFile[] = fileArray.map(f => ({
      id: generateId(),
      file: f,
      rawText: "",
      status: ProcessingStatus.IDLE
    }));

    setFiles(prev => [...prev, ...newDocFiles]);
    
    // Automatically start processing
    newDocFiles.forEach(doc => processFile(doc));
  };

  const processFile = async (doc: DocFile) => {
    // Update status to reading
    updateFileStatus(doc.id, ProcessingStatus.READING);

    try {
      // 1. Extract Text
      const rawText = await extractTextFromDocx(doc.file);
      
      updateFileState(doc.id, { rawText, status: ProcessingStatus.PROCESSING });

      // 2. AI Process
      const profile = await processProfileWithGemini(rawText);

      updateFileState(doc.id, { 
        status: ProcessingStatus.COMPLETED, 
        result: profile 
      });

      // Select the first completed file if none selected
      setSelectedFileId(prev => prev ? prev : doc.id);

    } catch (error: any) {
      console.error(error);
      updateFileState(doc.id, { 
        status: ProcessingStatus.ERROR, 
        error: error.message || "Unknown error" 
      });
    }
  };

  const updateFileStatus = (id: string, status: ProcessingStatus) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status } : f));
  };

  const updateFileState = (id: string, updates: Partial<DocFile>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleProfileUpdate = (fileId: string, updatedProfile: FormattedProfile) => {
    updateFileState(fileId, { result: updatedProfile });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSelectFile = (id: string) => {
    setSelectedFileId(id);
  };

  const removeFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFiles(prev => {
      const remaining = prev.filter(f => f.id !== id);
      if (selectedFileId === id) {
        setSelectedFileId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  const selectedDoc = files.find(f => f.id === selectedFileId);

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-gray-50">
      
      {/* Sidebar / List View */}
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col z-10 shadow-lg md:shadow-none h-[40vh] md:h-full">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 mb-2">
            BioCraft
          </h1>
          <p className="text-xs text-gray-500">
            Batch process Word documents into structured profiles.
          </p>
        </div>

        {/* Upload Area */}
        <div 
          className={`m-4 p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer text-center group
            ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            accept=".docx" 
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-gray-600">Click or Drop .docx</p>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 no-scrollbar">
          {files.map(file => (
            <div 
              key={file.id}
              onClick={() => handleSelectFile(file.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer relative group
                ${selectedFileId === file.id 
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm font-medium text-gray-800 truncate" title={file.file.name}>
                    {file.file.name}
                  </p>
                  <p className="text-xs mt-1 flex items-center gap-1">
                    {file.status === ProcessingStatus.IDLE && <span className="text-gray-400">Waiting...</span>}
                    {file.status === ProcessingStatus.READING && <span className="text-blue-500 animate-pulse">Reading file...</span>}
                    {file.status === ProcessingStatus.PROCESSING && <span className="text-amber-500 animate-pulse">AI thinking...</span>}
                    {file.status === ProcessingStatus.COMPLETED && <span className="text-green-600 font-medium">Ready</span>}
                    {file.status === ProcessingStatus.ERROR && <span className="text-red-500">Error</span>}
                  </p>
                </div>
                <button 
                  onClick={(e) => removeFile(e, file.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity absolute right-2 top-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              No files yet
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-100 h-[60vh] md:h-full overflow-y-auto p-4 md:p-8 flex items-start justify-center">
        {selectedDoc ? (
          <div className="w-full max-w-4xl animate-fade-in">
             {selectedDoc.status === ProcessingStatus.COMPLETED && selectedDoc.result ? (
               <div className="flex flex-col gap-4">
                 <div className="flex justify-end">
                    <button
                      onClick={() => selectedDoc.result && generateAndDownloadDocx(selectedDoc.result)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download .docx
                    </button>
                 </div>
                 <ProfileRenderer 
                   data={selectedDoc.result} 
                   onUpdate={(updated) => handleProfileUpdate(selectedDoc.id, updated)}
                 />
               </div>
             ) : (
               <div className="bg-white rounded-xl shadow-sm p-12 text-center h-[29.7cm] flex flex-col items-center justify-center">
                 {selectedDoc.status === ProcessingStatus.ERROR ? (
                   <>
                     <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                     </div>
                     <h3 className="text-lg font-bold text-gray-800">Processing Failed</h3>
                     <p className="text-gray-500 mt-2">{selectedDoc.error}</p>
                   </>
                 ) : (
                   <>
                      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {selectedDoc.status === ProcessingStatus.READING ? 'Reading Document...' : 'AI Analyzing Profile...'}
                      </h3>
                      <p className="text-gray-500 mt-2">This may take a few seconds.</p>
                   </>
                 )}
               </div>
             )}
          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
             <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 opacity-50">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
             </div>
             <p className="text-lg">Select or upload a document to view results</p>
          </div>
        )}
      </main>
    </div>
  );
}