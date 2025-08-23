
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useStudyData } from '../context/StudyDataContext';
import type { QuizQuestion } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const QuizPage: React.FC = () => {
  const { studyMaterials, addQuizResult } = useStudyData();
  const navigate = ReactRouterDOM.useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!studyMaterials) {
      navigate('/');
    } else {
        setSelectedAnswers(new Array(studyMaterials.quiz.length).fill(null));
    }
  }, [studyMaterials, navigate]);

  if (!studyMaterials) {
    return <LoadingSpinner />;
  }

  const quiz = studyMaterials.quiz;

  const handleSelectAnswer = (option: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = option;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };
  
  const handleSubmit = () => {
    let correctAnswers = 0;
    quiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    const finalScore = (correctAnswers / quiz.length) * 100;
    setScore(finalScore);
    setIsFinished(true);
    addQuizResult({
      topic: studyMaterials.topics.join(', ') || 'General',
      score: finalScore,
      totalQuestions: quiz.length,
      correctAnswers,
    });
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(quiz.length).fill(null));
    setIsFinished(false);
    setScore(0);
  };
  
  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto text-center bg-card-bg p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-text-primary">Quiz Complete!</h1>
        <p className="mt-4 text-5xl font-bold text-primary">{score.toFixed(0)}%</p>
        <p className="mt-2 text-lg text-text-secondary">
          You answered {Math.round((score/100) * quiz.length)} out of {quiz.length} questions correctly.
        </p>
        <div className="mt-8 space-x-4">
            <button onClick={restartQuiz} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover">
                Retake Quiz
            </button>
            <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-green-600">
                View Dashboard
            </button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = quiz[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto">
        <div className="bg-card-bg p-8 rounded-xl shadow-lg">
            <div className="mb-4">
                <p className="text-sm font-medium text-primary">Question {currentQuestionIndex + 1} of {quiz.length}</p>
                <h2 className="text-2xl font-semibold text-text-primary mt-1">{currentQuestion.question}</h2>
            </div>
            <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelectAnswer(option)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            selectedAnswers[currentQuestionIndex] === option
                                ? 'bg-primary border-primary text-white'
                                : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!selectedAnswers[currentQuestionIndex]}
                    className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {currentQuestionIndex < quiz.length - 1 ? 'Next' : 'Finish'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default QuizPage;
