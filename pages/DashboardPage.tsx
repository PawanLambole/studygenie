
import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useStudyData } from '../context/StudyDataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage: React.FC = () => {
    const { quizResults, isDataLoading } = useStudyData();
    const navigate = ReactRouterDOM.useNavigate();

    const overallStats = useMemo(() => {
        if (quizResults.length === 0) {
            return {
                averageScore: 0,
                totalQuizzes: 0,
                totalQuestions: 0,
                correctAnswers: 0
            };
        }

        const totalScore = quizResults.reduce((acc, result) => acc + result.score, 0);
        const totalQuestions = quizResults.reduce((acc, result) => acc + result.totalQuestions, 0);
        const correctAnswers = quizResults.reduce((acc, result) => acc + result.correctAnswers, 0);
        
        return {
            averageScore: totalScore / quizResults.length,
            totalQuizzes: quizResults.length,
            totalQuestions,
            correctAnswers
        };
    }, [quizResults]);
    
    const chartData = quizResults.map((result, index) => ({
      name: `Quiz ${quizResults.length - index}`, // Show latest quiz first on chart
      score: result.score,
      topic: result.topic,
    })).reverse(); // Reverse to show chronological order in chart

    if (isDataLoading) {
        return <LoadingSpinner text="Fetching your progress..." />;
    }

    if (quizResults.length === 0) {
        return (
            <div className="text-center max-w-lg mx-auto">
                <h1 className="text-3xl font-bold mb-4 text-text-primary">Your Dashboard is Empty</h1>
                <p className="text-text-secondary mb-6">Take a quiz to start tracking your progress and see your performance here.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover"
                >
                    Generate a New Study Guide
                </button>
            </div>
        );
    }
    
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-text-primary">Your Progress Dashboard</h1>
            
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Average Score" value={`${overallStats.averageScore.toFixed(0)}%`} />
                <StatCard title="Quizzes Taken" value={overallStats.totalQuizzes.toString()} />
                <StatCard title="Total Questions" value={overallStats.totalQuestions.toString()} />
                <StatCard title="Correct Answers" value={overallStats.correctAnswers.toString()} />
            </div>

            {/* Performance Chart */}
            <div className="bg-card-bg p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Quiz Performance Over Time</h2>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis unit="%" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="score" fill="#4F46E5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card-bg p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Recent Quizzes</h2>
                <ul className="space-y-4">
                    {quizResults.slice(0, 5).map((result, index) => (
                        <li key={index} className="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                                <p className="font-semibold">{result.topic}</p>
                                <p className="text-sm text-text-secondary">
                                    {result.correctAnswers} / {result.totalQuestions} correct
                                </p>
                            </div>
                            <p className="text-lg font-bold text-primary">{result.score.toFixed(0)}%</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string, value: string }> = ({ title, value }) => (
    <div className="bg-card-bg p-6 rounded-xl shadow-lg text-center">
        <p className="text-lg text-text-secondary">{title}</p>
        <p className="text-4xl font-extrabold text-primary mt-2">{value}</p>
    </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="label font-bold">{`${label}`}</p>
        <p className="intro text-primary">{`Score : ${payload[0].value}%`}</p>
        <p className="desc text-text-secondary">{`Topic: ${payload[0].payload.topic}`}</p>
      </div>
    );
  }
  return null;
};

export default DashboardPage;
