import React, { useState, useEffect } from 'react';

interface ScoreDialProps {
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  label?: string;
}

const ScoreDial: React.FC<ScoreDialProps> = ({ 
  score = 750, 
  size = 'lg', 
  animated = true,
  label = 'ProbR™ Score'
}) => {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const [currentScore, setCurrentScore] = useState(score);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48 md:w-64 md:h-64'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl md:text-4xl'
  };

  useEffect(() => {
    if (animated) {
      // Animate score changes every 3 seconds
      const interval = setInterval(() => {
        const newScore = Math.floor(Math.random() * 200) + 650; // Random score between 650-850
        setCurrentScore(newScore);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [animated]);

  useEffect(() => {
    // Animate the display score to match current score
    if (displayScore === currentScore) return;

    const duration = 1500;
    const steps = 60;
    const increment = (currentScore - displayScore) / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setDisplayScore(prev => {
        const newScore = prev + increment;
        if (step >= steps) {
          clearInterval(timer);
          return currentScore;
        }
        return newScore;
      });
    }, duration / steps);

    return () => clearInterval(timer);
  }, [currentScore, displayScore]);

  // Calculate the stroke dash array for the progress circle
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, displayScore / 1000)) * circumference;

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 800) return '#10B981'; // Green
    if (score >= 700) return '#F59E0B'; // Yellow
    if (score >= 600) return '#EF4444'; // Orange
    return '#DC2626'; // Red
  };

  const scoreColor = getScoreColor(displayScore);

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto`}>
      {/* SVG Circle */}
      <svg 
        className="w-full h-full transform -rotate-90" 
        viewBox="0 0 200 200"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
      >
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="12"
          fill="transparent"
          className="opacity-30"
        />
        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke={scoreColor}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${scoreColor}40)`
          }}
        />
      </svg>
      
      {/* Score display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div 
          className={`font-bold ${textSizes[size]} text-credion-charcoal mb-1`}
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          {Math.round(displayScore)}
        </div>
        <div className="text-xs md:text-sm text-gray-500 font-medium text-center px-2">
          {label}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          /1000
        </div>
      </div>

      {/* Pulse animation ring for large size */}
      {size === 'lg' && animated && (
        <div 
          className="absolute inset-4 rounded-full border-2 opacity-20 animate-ping"
          style={{ 
            borderColor: scoreColor,
            animationDuration: '3s'
          }}
        />
      )}
    </div>
  );
};

export default ScoreDial;