import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { StudyMaterials, QuizResult } from '../types';
import { generateStudyMaterials } from '../services/geminiService';
import { useAuth } from './AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';


interface StudyDataContextType {
  sourceText: string;
  setSourceText: (text: string) => void;
  studyMaterials: StudyMaterials | null;
  quizResults: QuizResult[];
  isLoading: boolean; // For generating materials
  isDataLoading: boolean; // For fetching data from Firestore
  error: string | null;
  generateNewStudyMaterials: (text: string) => Promise<boolean>;
  addQuizResult: (result: QuizResult) => void;
  clearData: () => void;
}

const StudyDataContext = createContext<StudyDataContextType | undefined>(undefined);

export const StudyDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [sourceText, setSourceText] = useState<string>('');
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterials | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setIsDataLoading(true);
      const q = query(collection(db, `users/${currentUser.uid}/quizResults`), orderBy('timestamp', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const results: QuizResult[] = [];
        querySnapshot.forEach((doc) => {
          results.push(doc.data() as QuizResult);
        });
        setQuizResults(results);
        setIsDataLoading(false);
      }, (err) => {
        console.error("Error fetching quiz results:", err);
        setError("Could not fetch quiz history.");
        setIsDataLoading(false);
      });

      return () => unsubscribe();
    } else {
      // User logged out, clear their data
      setQuizResults([]);
      setIsDataLoading(false);
    }
  }, [currentUser]);


  const generateNewStudyMaterials = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const materials = await generateStudyMaterials(text);
      setSourceText(text);
      setStudyMaterials(materials);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
      return false;
    }
  }, []);

  const addQuizResult = useCallback(async (result: QuizResult) => {
    if (!currentUser) {
        console.error("Cannot add quiz result, no user logged in.");
        return;
    }
    try {
        const resultWithTimestamp = { ...result, timestamp: new Date() };
        await addDoc(collection(db, `users/${currentUser.uid}/quizResults`), resultWithTimestamp);
        // The onSnapshot listener will update the state automatically, 
        // but we can add it here for immediate feedback if needed.
        // setQuizResults(prevResults => [result, ...prevResults]);
    } catch (err) {
        console.error("Error adding quiz result to Firestore:", err);
        // Optionally show an error to the user
    }
  }, [currentUser]);

  const clearData = useCallback(() => {
    setSourceText('');
    setStudyMaterials(null);
    // quizResults are cleared by the useEffect when user logs out
  }, []);

  return (
    <StudyDataContext.Provider value={{
      sourceText,
      setSourceText,
      studyMaterials,
      quizResults,
      isLoading,
      isDataLoading,
      error,
      generateNewStudyMaterials,
      addQuizResult,
      clearData
    }}>
      {children}
    </StudyDataContext.Provider>
  );
};

export const useStudyData = () => {
  const context = useContext(StudyDataContext);
  if (context === undefined) {
    throw new Error('useStudyData must be used within a StudyDataProvider');
  }
  return context;
};
