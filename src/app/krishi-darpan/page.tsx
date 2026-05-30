"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import VideoScroller from '@/components/VideoScroller';
import { getKrishiDarpanVideos } from '@/lib/videos';
import { Button } from '@/components/ui/button';

export default function KrishiDarpanPage() {
    const router = useRouter();
    const [videos, setVideos] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load videos
        const videoList = getKrishiDarpanVideos();
        const videoPaths = videoList.map(v => v.path);
        setVideos(videoPaths);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading videos...</p>
                </div>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="text-center max-w-md px-4">
                    <h2 className="text-2xl font-bold mb-2">No Videos Available</h2>
                    <p className="text-muted-foreground mb-6">
                        Please add MP4 video files to the <code className="bg-muted px-2 py-1 rounded">public/krishi-darpan-videos/</code> folder.
                    </p>
                    <Button onClick={() => router.push('/')}>
                        Go Back Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen overflow-hidden">
            {/* Back button overlay */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/50 to-transparent">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="text-white hover:bg-white/20"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>
            </div>

            {/* Video scroller */}
            <VideoScroller videos={videos} />
        </div>
    );
}
