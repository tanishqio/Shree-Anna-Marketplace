// Helper to get list of videos from the krishi-darpan-videos folder

export interface VideoInfo {
    filename: string;
    path: string;
}

/**
 * Get list of available Krishi Darpan videos
 * Videos should be placed in public/krishi-darpan-videos/
 */
export function getKrishiDarpanVideos(): VideoInfo[] {
    // For now, we'll manually list the videos
    // In production, this could be replaced with an API call to list files
    const videoFilenames = [
        '1.mp4',
        '2.mp4',
        '3.mp4',
        '4.mp4',
        '5.mp4',
        '6.mp4',
        '7.mp4',
        '8.mp4',
        '9.mp4',
        '10.mp4',
        '11.mp4',
    ];

    return videoFilenames.map(filename => ({
        filename,
        path: `/krishi-darpan-videos/${filename}`,
    }));
}

/**
 * Check if a video file exists
 * This is a client-side check - the actual file must exist in public folder
 */
export function getVideoPath(filename: string): string {
    return `/krishi-darpan-videos/${filename}`;
}
