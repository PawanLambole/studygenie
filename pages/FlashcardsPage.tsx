
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useStudyData } from '../context/StudyDataContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Flashcard: React.FC<{ question: string, answer: string, isFlipped: boolean, onClick: () => void }> = ({ question, answer, isFlipped, onClick }) => {
    return (
        <div className="w-full h-80 perspective-1000" onClick={onClick}>
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front of card */}
                <div className="absolute w-full h-full backface-hidden bg-card-bg rounded-xl shadow-2xl flex items-center justify-center p-6 border-2 border-primary">
                    <p className="text-2xl font-semibold text-center text-text-primary">{question}</p>
                </div>
                {/* Back of card */}
                <div className="absolute w-full h-full backface-hidden bg-primary rounded-xl shadow-2xl flex items-center justify-center p-6 transform rotate-y-180">
                    <p className="text-xl text-center text-white">{answer}</p>
                </div>
            </div>
        </div>
    );
};

const FlashcardsPage: React.FC = () => {
    const { studyMaterials } = useStudyData();
    const navigate = ReactRouterDOM.useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    
    useEffect(() => {
        if (!studyMaterials) {
            navigate('/');
        }
    }, [studyMaterials, navigate]);

    if (!studyMaterials) {
        return <LoadingSpinner />;
    }

    const flashcards = studyMaterials.flashcards;

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev - 1);
        }
    };

    const currentCard = flashcards[currentIndex];

    return (
        <div className="max-w-2xl mx-auto flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-2 text-text-primary">Flashcards</h1>
            <p className="text-text-secondary mb-6">Click the card to reveal the answer.</p>
            
            <Flashcard 
                question={currentCard.question} 
                answer={currentCard.answer} 
                isFlipped={isFlipped} 
                onClick={() => setIsFlipped(!isFlipped)} 
            />

            <div className="mt-6 text-center text-lg font-medium text-text-secondary">
                Card {currentIndex + 1} of {flashcards.length}
            </div>

            <div className="flex justify-between w-full mt-4">
                <button 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0}
                    className="px-6 py-2 bg-gray-300 text-text-primary font-semibold rounded-lg shadow-md hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button 
                    onClick={handleNext} 
                    disabled={currentIndex === flashcards.length - 1}
                    className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
            
             <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-preserve-3d { transform-style: preserve-3d; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
            `}</style>
        </div>
    );
};

export default FlashcardsPage;
