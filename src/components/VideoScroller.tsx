"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface VideoScrollerProps {
    videos: string[];
}

export default function VideoScroller({ videos }: VideoScrollerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.75, // Video must be 75% visible to be considered "in view"
        };

        const callback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                const videoElement = entry.target as HTMLVideoElement;

                if (entry.isIntersecting) {
                    // Play video when it comes into view
                    videoElement.play().catch(err => console.log('Autoplay failed:', err));

                    // Update current video index
                    const index = videoRefs.current.indexOf(videoElement);
                    if (index !== -1) {
                        setCurrentVideoIndex(index);
                    }
                } else {
                    // Pause video when it goes out of view
                    videoElement.pause();
                    videoElement.currentTime = 0; // Reset to beginning
                }
            });
        };

        const observer = new IntersectionObserver(callback, options);

        // Observe all video elements
        videoRefs.current.forEach((video) => {
            if (video) {
                observer.observe(video);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [videos]);

    return (
        <div
            ref={containerRef}
            className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black"
            style={{ scrollbarWidth: 'none' }}
        >
            {videos.map((videoSrc, index) => (
                <motion.div
                    key={index}
                    className="h-screen w-full snap-start snap-always relative flex items-center justify-center bg-black"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* 9:16 Aspect Ratio Container */}
                    <div
                        className="relative bg-black overflow-hidden rounded-lg shadow-2xl"
                        style={{
                            aspectRatio: '9 / 16',
                            maxHeight: '95vh',
                            width: 'auto',
                            height: '95vh'
                        }}
                    >
                        <video
                            ref={(el) => {
                                videoRefs.current[index] = el;
                            }}
                            className="absolute inset-0 w-full h-full object-cover"
                            src={videoSrc}
                            loop
                            playsInline
                            muted={false}
                            preload="metadata"
                            controlsList="nodownload"
                        />
                    </div>

                    {/* Yellow progress line indicator */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                            style={{
                                width: `${((currentVideoIndex + 1) / videos.length) * 100}%`
                            }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
