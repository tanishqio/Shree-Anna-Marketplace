"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface FlashCardStep {
  id: string;
  title: string;
  titleHi?: string;
  titleKn?: string;
  titleTe?: string;
  description: string;
  descriptionHi?: string;
  descriptionKn?: string;
  descriptionTe?: string;
  icon?: React.ReactNode;
  image?: string;
  input?: React.ReactNode;
  voicePrompt?: string;
  voicePromptHi?: string;
  voicePromptKn?: string;
  voicePromptTe?: string;
  canProceed?: boolean; // If false, Next button is disabled
}

interface FlashCardProps {
  steps: FlashCardStep[];
  onComplete: (data: Record<string, unknown>) => void;
  onStepChange?: (step: number) => void;
  className?: string;
  autoAdvanceTrigger?: number; // Increment this to auto-advance to next step
  onBack?: () => void; // Function to call when back is clicked on the first step
}

export function FlashCard({ steps, onComplete, onStepChange, className = '', autoAdvanceTrigger = 0, onBack }: FlashCardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();
  const prevTriggerRef = useRef(autoAdvanceTrigger);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Check if current step can proceed (default true if not specified)
  const canProceed = step.canProceed !== undefined ? step.canProceed : true;

  // Auto-advance when trigger changes
  useEffect(() => {
    if (autoAdvanceTrigger > prevTriggerRef.current && canProceed && !isLastStep) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
      onStepChange?.(currentStep + 1);
    }
    prevTriggerRef.current = autoAdvanceTrigger;
  }, [autoAdvanceTrigger, canProceed, isLastStep, currentStep, onStepChange]);

  // Get localized content
  const getLocalizedText = (base: string, hi?: string, kn?: string, te?: string) => {
    switch (language) {
      case 'hi': return hi || base;
      case 'kn': return kn || base;
      case 'te': return te || base;
      default: return base;
    }
  };

  const localizedTitle = getLocalizedText(step.title, step.titleHi, step.titleKn, step.titleTe);
  const localizedDescription = getLocalizedText(step.description, step.descriptionHi, step.descriptionKn, step.descriptionTe);
  const localizedVoicePrompt = getLocalizedText(
    step.voicePrompt || step.description,
    step.voicePromptHi || step.voicePrompt,
    step.voicePromptKn,
    step.voicePromptTe
  );

  const goNext = () => {
    if (!isLastStep) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
      onStepChange?.(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const goPrev = () => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
      onStepChange?.(currentStep - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const playVoicePrompt = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(localizedVoicePrompt);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Progress indicator */}
      <div className="flex gap-2 mb-6">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${idx <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
          />
        ))}
      </div>

      {/* Card container */}
      <div className="relative min-h-[450px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="relative"
          >
            <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col border border-border min-h-[450px] max-h-[75vh] overflow-y-auto">
              {/* Voice prompt button - reads aloud */}
              <button
                onClick={playVoicePrompt}
                className={`absolute top-4 right-4 p-3 rounded-full transition-all z-10 ${isSpeaking ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-muted hover:bg-primary/20'
                  }`}
                aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
                title={isSpeaking ? "Stop" : "Read aloud"}
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Icon/Image */}
              {(step.icon || step.image) && (
                <div className="flex justify-center mb-6">
                  {step.icon ? (
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {step.icon}
                    </div>
                  ) : step.image ? (
                    <img
                      src={step.image}
                      alt={localizedTitle}
                      className="w-32 h-32 object-contain rounded-xl"
                    />
                  ) : null}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 flex flex-col items-center text-center">
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 font-heading">
                  {localizedTitle}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6">
                  {localizedDescription}
                </p>

                {/* Input area */}
                {step.input && (
                  <div className="w-full mt-auto">
                    {step.input}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6 gap-4">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={isFirstStep && !onBack}
          className="flex-1 h-12 sm:h-14 text-base sm:text-lg touch-target"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back
        </Button>
        <Button
          onClick={goNext}
          disabled={!canProceed}
          className="flex-1 h-12 sm:h-14 text-base sm:text-lg touch-target bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastStep ? (
            <>
              <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Done
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

