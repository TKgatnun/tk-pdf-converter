import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';

export default function PdfConverter() {
  const [files, setFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);

  // 1. Handle files being dropped into the zone
  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // 2. Remove a specific file from the queue
  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
  };

  // 3. The Core Engine Execution
  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setError(null);

    // Package files exactly how Gotenberg expects them
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      // Send directly to your active Koyeb engine
      const response = await fetch('https://tk-pdf-proxy.onrender.com/convert', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Conversion failed. Please try again.');
      }

      // 4. Handle the returning PDF or ZIP file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Smart naming: If 1 file, name it .pdf. If multiple, name it .zip
      const downloadName = files.length > 1 
        ? 'TK_Converted_Batch.zip' 
        : `${files[0].name.split('.')[0]}_converted.pdf`;
        
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clear the queue after a successful download
      setFiles([]);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-badge">TK</div>
        <div className="app-title">
          <h2>TK PDF Engine</h2>
          <p className="app-subtitle">Convert Word, Excel, and PowerPoint to PDF via server processing.</p>
        </div>
      </header>
      
      {/* Drag and Drop Zone */}
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'is-active' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag & drop Word, Excel, or PowerPoint files here, or click to select</p>
        )}
      </div>

        {/* File Queue List */}
        {files.length > 0 && (
          <section className="queue">
            <div className="queue-head">
              <h4>Files to convert</h4>
              <p className="queue-meta">{files.length} file{files.length !== 1 ? 's' : ''} queued</p>
            </div>
            <ul className="queue-list">
              {files.map((file) => (
                <li key={file.name} className="queue-item">
                  <span className="queue-filename" title={file.name}>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(file.name)}
                    className="queue-remove"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Error Message */}
        {error && <p className="error">{error}</p>}

        {/* Convert Button */}
        <button 
          onClick={handleConvert} 
          disabled={files.length === 0 || isConverting}
          className="primary"
          style={{ width: '100%' }}
        >
          {isConverting ? 'Processing on Server...' : `Convert ${files.length} File${files.length !== 1 ? 's' : ''}`}
        </button>

        <div className="fineprint">
          <span className="dot" />
          <p>Your files are uploaded only for conversion, then immediately downloaded.</p>
        </div>
      </div>
    </div>
  );
}