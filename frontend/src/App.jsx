import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

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
      const response = await fetch('http://localhost:8000/convert', {
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
    <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>TK PDF Engine</h2>
      
      {/* Drag and Drop Zone */}
      <div 
        {...getRootProps()} 
        style={{
          border: '2px dashed #007bff',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
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
        <div style={{ marginTop: '20px' }}>
          <h4>Files to Convert:</h4>
          <ul style={{ paddingLeft: '20px' }}>
            {files.map((file) => (
              <li key={file.name} style={{ marginBottom: '8px' }}>
                {file.name} 
                <button 
                  onClick={() => removeFile(file.name)}
                  style={{ marginLeft: '10px', color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}
                >
                  (Remove)
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error Message */}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      {/* Convert Button */}
      <button 
        onClick={handleConvert} 
        disabled={files.length === 0 || isConverting}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: files.length === 0 || isConverting ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: files.length === 0 || isConverting ? 'not-allowed' : 'pointer',
          width: '100%'
        }}
      >
        {isConverting ? 'Processing on Server...' : `Convert ${files.length} File${files.length !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
}