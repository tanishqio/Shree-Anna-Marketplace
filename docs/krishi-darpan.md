# Krishi Darpan (कृषि दर्पण) - Agricultural Video Hub

## Overview
Krishi Darpan is a vertical video scroller interface (similar to Instagram Reels or YouTube Shorts) for agricultural educational videos.

## Features
- ✅ Full-screen vertical video player
- ✅ Auto-play videos when in view
- ✅ Auto-pause when scrolling away
- ✅ Smooth snap-scroll behavior  
- ✅ Touch/swipe navigation
- ✅ Minimal UI - distraction-free viewing
- ✅ Consistent with site theme
- ✅ Video progress indicators

## How to Add Videos

### Step 1: Place Video Files
Add your MP4 video files to the folder:
```
public/krishi-darpan-videos/
```

### Step 2: Update Video List
Edit `src/lib/videos.ts` and add your video filenames:

```typescript
const videoFilenames = [
  'video1.mp4',
  'video2.mp4',
  'video3.mp4',
  'your-new-video.mp4',  // Add your video here
];
```

### Step 3: Test
Visit `http://localhost:3000/krishi-darpan` to see your videos!

## Video Requirements
- **Format**: MP4 (H.264 codec recommended)
- **Orientation**: Vertical (9:16 ratio) works best
- **File Size**: Keep under 50MB for best performance
- **Naming**: Use descriptive filenames (e.g., `millet-harvesting.mp4`)

## Usage

### Accessing Krishi Darpan
- Click "Krishi Darpan" (कृषि दर्पण) in the navigation bar
- Or navigate directly to `/krishi-darpan`

### Navigation
- **Scroll/Swipe Up**: Next video
- **Scroll/Swipe Down**: Previous video
- **Back Button**: Return to previous page (top-left corner)

## File Structure
```
src/
  app/
    krishi-darpan/
      page.tsx                 # Main page component
  components/
    VideoScroller.tsx          # Video player component
  lib/
    videos.ts                  # Video list configuration
public/
  krishi-darpan-videos/
    video1.mp4                 # Your video files go here
    video2.mp4
    ...
```

## Future Enhancements
- Add video titles/captions
- Like/share functionality
- Backend API for dynamic video loading
- Video upload interface
- Analytics tracking
- Comments section

## Technical Details

### Auto-Play Logic
Uses IntersectionObserver API to detect when videos are 75% visible, then triggers auto-play/pause accordingly.

### Performance
- Videos load with `preload="metadata"` for faster initial load
- Lazy loading prevents all videos from loading at once
- Smooth scroll-snap for 60fps animations

### Browser Compatibility
Works on all modern browsers that support:
- HTML5 Video
- IntersectionObserver API
- CSS Scroll Snap

---

**Note**: Remember to add actual video files to the `public/krishi-darpan-videos/` folder for the feature to work!
