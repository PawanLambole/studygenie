
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useStudyData } from '../context/StudyDataContext';
import { translateText } from '../services/geminiService';
import { SUPPORTED_LANGUAGES } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import AITutor from '../components/AITutor';

const StudyHubPage: React.FC = () => {
  const { studyMaterials, sourceText } = useStudyData();
  const navigate = ReactRouterDOM.useNavigate();
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    if (!studyMaterials) {
      navigate('/');
    }
  }, [studyMaterials, navigate]);

  const handleTranslate = async () => {
    if (!studyMaterials || targetLanguage === 'en') {
      setTranslatedSummary('');
      return;
    }
    setIsTranslating(true);
    try {
      const translation = await translateText(studyMaterials.summary, SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name || 'English');
      setTranslatedSummary(translation);
    } catch (error) {
      console.error("Translation failed", error);
      setTranslatedSummary("Sorry, translation failed.");
    } finally {
      setIsTranslating(false);
    }
  };
  
  if (!studyMaterials) {
    return <LoadingSpinner text="Loading study materials..." />;
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Summary Card */}
        <div className="bg-card-bg p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Summary</h2>
          <p className="text-text-secondary leading-relaxed">{studyMaterials.summary}</p>
          <div className="mt-4 flex items-center gap-4">
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="px-4 py-2 bg-gray-100 text-text-primary rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-gray-400"
            >
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
          </div>
          {translatedSummary && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800">Translation:</h3>
              <p className="text-blue-700">{translatedSummary}</p>
            </div>
          )}
        </div>

        {/* AI Tutor */}
        <AITutor />
      </div>

      {/* Tools & Navigation Card */}
      <div className="space-y-6">
        <div className="bg-card-bg p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Study Tools</h2>
          <div className="space-y-4">
            <ReactRouterDOM.Link to="/flashcards" className="block w-full text-center px-6 py-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-all transform hover:scale-105">
              Start Flashcards ({studyMaterials.flashcards.length})
            </ReactRouterDOM.Link>
            <ReactRouterDOM.Link to="/quiz" className="block w-full text-center px-6 py-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-all transform hover:scale-105">
              Take Quiz ({studyMaterials.quiz.length} questions)
            </ReactRouterDOM.Link>
            <ReactRouterDOM.Link to="/dashboard" className="block w-full text-center px-6 py-4 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all transform hover:scale-105">
              View Progress
            </ReactRouterDOM.Link>
          </div>
        </div>
        <div className="bg-card-bg p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-text-primary mb-2">Topics Covered</h3>
          <ul className="list-disc list-inside space-y-1 text-text-secondary">
            {studyMaterials.topics.map((topic, index) => <li key={index}>{topic}</li>)}
          </ul>
        </div>
        <div className="bg-card-bg p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold text-text-primary">Source Material</h3>
             <button onClick={() => setShowSource(!showSource)} className="text-sm font-semibold text-primary hover:underline">
                {showSource ? 'Hide' : 'Show'}
             </button>
          </div>
          {showSource && (
            <div className="mt-4 p-4 bg-gray-50 border rounded-lg max-h-48 overflow-y-auto">
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{sourceText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyHubPage;
