"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { useLanguage } from '@/lib/hooks/useLanguage';

export default function NotFound() {
    const { language } = useLanguage();

    const content = {
        title: language === 'hi' ? 'पृष्ठ नहीं मिला'
            : language === 'te' ? 'పేజీ కనుగొనబడలేదు'
                : language === 'kn' ? 'ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ'
                    : language === 'ta' ? 'பக்கம் கிடைக்கவில்லை'
                        : language === 'mr' ? 'पृष्ठ सापडले नाही'
                            : 'Page Not Found',
        description: language === 'hi' ? 'हमें खेद है, जिस पृष्ठ को आप ढूंढ रहे हैं वह मौजूद नहीं है।'
            : language === 'te' ? 'క్షమించండి, మీరు వెతుకుతున్న పేజీ ఉనికిలో లేదు.'
                : language === 'kn' ? 'ಕ್ಷಮಿಸಿ, ನೀವು ಹುಡುಕುತ್ತಿರುವ ಪುಟ ಅಸ್ತಿತ್ವದಲ್ಲಿಲ್ಲ.'
                    : language === 'ta' ? 'மன்னிக்கவும், நீங்கள் தேடும் பக்கம் இல்லை.'
                        : language === 'mr' ? 'क्षमस्व, आपण शोधत असलेले पृष्ठ अस्तित्वात नाही.'
                            : "Oops! We couldn't find the page you're looking for.",
        button: language === 'hi' ? 'घर वापस जाएं'
            : language === 'te' ? 'ఇంటికి వెళ్ళు'
                : language === 'kn' ? 'ಮನೆಗೆ ಹೋಗಿ'
                    : language === 'ta' ? 'முகப்புக்குச் செல்'
                        : language === 'mr' ? 'घरी जा'
                            : 'Back to Home'
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="text-center max-w-md mx-auto">
                    {/* Illustration */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="w-40 h-40 bg-primary/10 rounded-full flex items-center justify-center relative">
                            <span className="text-6xl">🌾</span>
                            <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-2 shadow-lg border border-border">
                                <span className="text-4xl">❓</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl font-heading font-bold mb-2 text-primary"
                    >
                        404
                    </motion.h1>

                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-semibold mb-4 text-foreground"
                    >
                        {content.title}
                    </motion.h2>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-muted-foreground mb-8"
                    >
                        {content.description}
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Button asChild size="lg" className="gap-2">
                            <Link href="/">
                                <Home className="w-4 h-4" />
                                {content.button}
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </main>

            <footer className="py-6 border-t border-border text-center text-sm text-muted-foreground bg-muted/30">
                <p>© {new Date().getFullYear()} Shree Anna. All rights reserved.</p>
            </footer>
        </div>
    );
}
