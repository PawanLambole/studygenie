import React, { useState, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useStudyData } from '../context/StudyDataContext';
import { useAuth } from '../context/AuthContext';
import { extractTextFromImage } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';

declare const pdfjsLib: any;

const HomePage: React.FC = () => {
  const [localText, setLocalText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { generateNewStudyMaterials, isLoading, error, clearData } = useStudyData();
  const { currentUser } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setLocalText(''); // Clear text when file is selected
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setLocalText('');
    }
  };

  const processPdf = async (file: File): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = async (event) => {
            try {
                if (!event.target?.result) {
                    return reject('Could not read file');
                }
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs`;
                const pdf = await pdfjsLib.getDocument({ data: event.target.result as ArrayBuffer }).promise;
                let content = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    content += textContent.items.map((item: any) => item.str).join(' ');
                }
                resolve(content);
            } catch (error) {
                reject('Error processing PDF file.');
            }
        };
        reader.readAsArrayBuffer(file);
    });
};


  const handleGenerate = async () => {
    let studyText = localText.trim();
    let processingStarted = false;
    
    clearData();

    if (selectedFile) {
        processingStarted = true;
        try {
            if (selectedFile.type === 'application/pdf') {
                studyText = await processPdf(selectedFile);
            } else if (selectedFile.type.startsWith('image/')) {
                studyText = await extractTextFromImage(selectedFile);
            } else {
                alert('Unsupported file type. Please upload a PDF or an image.');
                return;
            }
        } catch(err) {
            alert(err instanceof Error ? err.message : 'Failed to process file.');
            return;
        }
    }

    if (!studyText) {
      alert('Please paste some text or upload a file.');
      return;
    }
    
    const success = await generateNewStudyMaterials(studyText);
    if (success) {
      navigate('/study-hub');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl md:text-6xl">
          Supercharge Your Studies with <span className="text-primary">StudyGenie</span>
        </h1>
        {currentUser ? (
          <p className="mt-4 text-lg text-text-secondary">
            Welcome back, {currentUser.email}! Create a new study guide below or head to your dashboard.
          </p>
        ) : (
          <p className="mt-4 text-lg text-text-secondary">
            Paste your notes, upload a PDF or image, and let our AI create a personalized learning kit for you.
          </p>
        )}
      </div>

      <div className="bg-card-bg p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <textarea
                value={localText}
                onChange={(e) => {
                    setLocalText(e.target.value);
                    if(e.target.value) setSelectedFile(null);
                }}
                placeholder="Paste your study material here..."
                className="w-full h-64 p-4 bg-gray-100 text-text-primary placeholder-gray-500 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                disabled={isLoading || !!selectedFile}
                aria-label="Study Material Input"
            />
            <div className="flex items-center justify-center w-full h-64">
                <form 
                    className={`w-full h-full p-4 border-2 border-dashed rounded-xl flex flex-col justify-center items-center text-center cursor-pointer transition-colors ${dragActive ? 'border-primary bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="application/pdf,image/png,image/jpeg,image/webp"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                    {selectedFile ? (
                        <div>
                            <p className="font-semibold text-primary">{selectedFile.name}</p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFile(null);
                                    if(fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="mt-2 text-sm text-red-600 hover:underline"
                            >
                                Remove file
                            </button>
                        </div>
                    ) : (
                        <div>
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PDF or Images (PNG, JPG)</p>
                        </div>
                    )}
                </form>
            </div>
        </div>

        {error && <p className="text-red-500 mt-4 text-center" role="alert">{error}</p>}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full sm:w-auto px-12 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {isLoading ? 'Generating...' : 'Generate Study Guide'}
          </button>
        </div>
      </div>
      
      {isLoading && <LoadingSpinner text="Analyzing your material and building your study guide..." />}

      <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
        <div className="bg-card-bg p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-primary">Summaries</h3>
          <p className="mt-2 text-text-secondary">Get key points instantly.</p>
        </div>
        <div className="bg-card-bg p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-primary">Flashcards</h3>
          <p className="mt-2 text-text-secondary">Master concepts with active recall.</p>
        </div>
        <div className="bg-card-bg p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-primary">Quizzes</h3>
          <p className="mt-2 text-text-secondary">Test your knowledge and track progress.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
