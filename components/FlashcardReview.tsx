import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types';
import Icon from './Icon';

interface FlashcardReviewProps {
  deckName: string;
  cards: Flashcard[];
  onExit: () => void;
}

const FlashcardReview: React.FC<FlashcardReviewProps> = ({ deckName, cards, onExit }) => {
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Shuffle cards when the component mounts
    setShuffledCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards]);

  const handleFlip = () => setIsFlipped(prev => !prev);

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (e.code === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, shuffledCards.length]); // Re-bind to get latest state in closure

  if (shuffledCards.length === 0) {
    return (
      <div className="text-center">
        <p>No cards to review in this deck.</p>
        <button onClick={onExit} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Back</button>
      </div>
    );
  }

  const currentCard = shuffledCards[currentIndex];

  return (
    <div className="animate-fadeIn h-full flex flex-col">
      <header className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold">{deckName} - Review</h1>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center"
        >
          <Icon name="times" className="mr-2" /> Exit Review
        </button>
      </header>

      <div className="flex-grow flex flex-col items-center justify-center">
        {/* Progress Indicator */}
        <div className="w-full max-w-4xl mb-4">
            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Progress</span>
                <span>{currentIndex + 1} / {shuffledCards.length}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }}>
                </div>
            </div>
        </div>

        {/* Flashcard */}
        <div className="w-full max-w-4xl h-[36rem] mb-6">
            <div
              className={`flashcard w-full h-full cursor-pointer ${isFlipped ? 'flipped' : ''}`}
              onClick={handleFlip}
            >
              <div className="flashcard-inner rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flashcard-front bg-white dark:bg-slate-800 p-6 text-4xl text-center rounded-lg">
                  {currentCard.front}
                </div>
                <div className="flashcard-back bg-white dark:bg-slate-800 p-6 text-3xl text-center rounded-lg">
                  {currentCard.back}
                </div>
              </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="chevron-left" className="mr-2" /> Prev
          </button>
          <button
            onClick={handleFlip}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center text-base"
          >
            <Icon name="sync-alt" className="mr-2" /> Flip Card
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === shuffledCards.length - 1}
            className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <Icon name="chevron-right" className="ml-2" />
          </button>
        </div>
        <div className="text-sm text-slate-400 mt-4">
          Tip: Use <kbd className="px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-900">←</kbd> <kbd className="px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-900">→</kbd> to navigate and <kbd className="px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-900">Space</kbd> to flip.
        </div>
      </div>
    </div>
  );
};

export default FlashcardReview;