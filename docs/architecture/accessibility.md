# Shree Anna - Accessibility Guidelines (WCAG AA)

## Overview

This document outlines accessibility annotations and implementation guidelines for the Shree Anna Millets Marketplace, targeting WCAG 2.1 AA compliance with special focus on users with low literacy levels.

---

## Color Contrast Requirements

### Primary Colors Contrast Ratios

| Color Pair | Ratio | WCAG AA |
|------------|-------|---------|
| Millet Gold (#e9b93e) on White | 2.3:1 | ⚠️ Use for decorative only |
| Earth Brown (#a98a6a) on White | 3.4:1 | ⚠️ Large text only |
| Leaf Green (#4a9d4a) on White | 3.1:1 | ⚠️ Large text only |
| Terracotta (#e26b47) on White | 3.5:1 | ✅ Large text |
| Text (#1a1a1a) on White | 16:1 | ✅ All text |
| Muted (#6c757d) on White | 4.6:1 | ✅ Body text |

### Recommended Adjustments

```css
/* Use darker variants for interactive elements */
.text-primary-accessible { color: #c49a2c; } /* Darker gold */
.text-accent-accessible { color: #3a8a3a; } /* Darker green */
.text-destructive { color: #d32f2f; } /* High contrast red */
```

---

## Touch Target Sizes

All interactive elements must meet minimum touch target sizes for motor-impaired users and low-dexterity environments (agricultural field use).

### Minimum Sizes

| Element Type | Minimum Size | Recommended |
|--------------|--------------|-------------|
| Primary buttons | 44×44px | 48×48px |
| Secondary buttons | 44×44px | 44×44px |
| Icon buttons | 44×44px | 48×48px |
| MCQ options | 64×64px | 72px height |
| Form inputs | 44px height | 48px height |
| Checkboxes | 24×24px | 32×32px |
| Radio buttons | 24×24px | 32×32px |
| Links (inline) | 44px tap area | - |

### Implementation

```tsx
// Touch target utility class
<style>
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.touch-target-lg {
  min-height: 64px;
  min-width: 64px;
}
</style>

// Button component
<Button className="touch-target h-12 px-6">
  Submit
</Button>

// MCQ Card
<button className="touch-target-lg min-h-[72px] w-full">
  Option text
</button>
```

---

## Focus Management

### Focus Indicators

All focusable elements must have visible focus indicators:

```css
/* Default focus ring */
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Enhanced focus for important elements */
.focus-enhanced:focus-visible {
  outline: 3px solid var(--primary);
  outline-offset: 3px;
  box-shadow: 0 0 0 6px rgba(233, 185, 62, 0.2);
}
```

### Focus Trapping

For modal dialogs and popovers:

```tsx
import { FocusTrap } from '@headlessui/react';

function Modal({ isOpen, onClose, children }) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <FocusTrap>
        <DialogPanel>
          {children}
        </DialogPanel>
      </FocusTrap>
    </Dialog>
  );
}
```

### Focus Order

1. Skip link → Main content
2. Header navigation
3. Main content (logical reading order)
4. Sidebar (if present)
5. Footer

---

## ARIA Labels & Roles

### Navigation

```tsx
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a href="/dashboard" role="menuitem" aria-current="page">
        Dashboard
      </a>
    </li>
  </ul>
</nav>
```

### Voice Button

```tsx
<button
  aria-label="Record voice message"
  aria-pressed={isRecording}
  aria-live="polite"
>
  {isRecording ? (
    <span aria-hidden="true">🔴</span>
  ) : (
    <Mic aria-hidden="true" />
  )}
  <span className="sr-only">
    {isRecording ? 'Recording in progress. Click to stop.' : 'Click to start recording'}
  </span>
</button>
```

### MCQ Card

```tsx
<div 
  role="radiogroup" 
  aria-labelledby="question-heading"
  aria-describedby="question-help"
>
  <h2 id="question-heading">Select your millet type</h2>
  <p id="question-help" className="sr-only">
    Choose one option from the list below
  </p>
  
  {options.map((option, index) => (
    <label
      key={option.id}
      role="radio"
      aria-checked={selected === option.id}
      tabIndex={selected === option.id ? 0 : -1}
    >
      <input 
        type="radio" 
        name="millet-type"
        value={option.id}
        className="sr-only"
      />
      <span>{option.label}</span>
    </label>
  ))}
</div>
```

### Flash Card Flow

```tsx
<div 
  role="form" 
  aria-label="Create listing"
  aria-describedby="progress-indicator"
>
  <div 
    id="progress-indicator" 
    role="progressbar"
    aria-valuenow={currentStep}
    aria-valuemin={1}
    aria-valuemax={totalSteps}
  >
    Step {currentStep} of {totalSteps}
  </div>
  
  <div 
    role="region" 
    aria-live="polite"
    aria-atomic="true"
  >
    {/* Current step content */}
  </div>
</div>
```

### Loading States

```tsx
<Button disabled aria-busy="true">
  <Loader2 className="animate-spin" aria-hidden="true" />
  <span>Processing...</span>
</Button>

// Or with live region
<div aria-live="assertive" aria-atomic="true" className="sr-only">
  {isLoading && 'Loading, please wait...'}
  {isSuccess && 'Operation completed successfully'}
  {isError && 'An error occurred. Please try again.'}
</div>
```

### QR Code

```tsx
<figure role="img" aria-label={`QR code for batch ${batchCode}`}>
  <QRCodeSVG value={qrValue} />
  <figcaption className="sr-only">
    Scan this QR code to view traceability information for batch {batchCode}
  </figcaption>
</figure>
```

---

## Screen Reader Announcements

### Status Updates

```tsx
// Create a live region component
function LiveRegion({ message, priority = 'polite' }) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Usage in forms
function ListingForm() {
  const [announcement, setAnnouncement] = useState('');
  
  const handleSubmit = async () => {
    setAnnouncement('Submitting your listing...');
    await submitListing();
    setAnnouncement('Listing created successfully!');
  };
  
  return (
    <>
      <LiveRegion message={announcement} priority="assertive" />
      <form onSubmit={handleSubmit}>...</form>
    </>
  );
}
```

### Toast Notifications

```tsx
<Toast
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
>
  <span className="sr-only">Success:</span>
  Your listing has been published!
</Toast>
```

---

## Voice-First Accessibility

### Voice Button States

```tsx
<VoiceButton
  aria-label="Record voice input"
  aria-describedby="voice-instructions"
>
  <span id="voice-instructions" className="sr-only">
    Press and hold to record your voice message.
    Speak clearly in Hindi or your regional language.
    Release to stop recording.
  </span>
</VoiceButton>
```

### Audio Playback Controls

```tsx
<div role="group" aria-label="Audio playback controls">
  <button
    aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
    aria-pressed={isPlaying}
  >
    {isPlaying ? <Pause /> : <Play />}
  </button>
  
  <div
    role="slider"
    aria-label="Audio progress"
    aria-valuemin={0}
    aria-valuemax={duration}
    aria-valuenow={currentTime}
    aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
  />
  
  <button aria-label="Adjust volume">
    <Volume2 />
  </button>
</div>
```

---

## Form Accessibility

### Input Labels

```tsx
// Always associate labels with inputs
<div className="field">
  <Label htmlFor="quantity">
    Quantity (kg)
    <span className="text-destructive" aria-hidden="true">*</span>
    <span className="sr-only">(required)</span>
  </Label>
  <Input
    id="quantity"
    type="number"
    required
    aria-required="true"
    aria-describedby="quantity-help quantity-error"
  />
  <p id="quantity-help" className="text-sm text-muted-foreground">
    Enter the amount in kilograms
  </p>
  {error && (
    <p id="quantity-error" className="text-destructive" role="alert">
      {error}
    </p>
  )}
</div>
```

### Error Handling

```tsx
<form 
  noValidate 
  onSubmit={handleSubmit}
  aria-describedby={hasErrors ? 'form-errors' : undefined}
>
  {hasErrors && (
    <div id="form-errors" role="alert" className="bg-destructive/10 p-4 rounded-lg">
      <h3>Please fix the following errors:</h3>
      <ul>
        {errors.map((error, i) => (
          <li key={i}>
            <a href={`#${error.field}`}>{error.message}</a>
          </li>
        ))}
      </ul>
    </div>
  )}
  
  {/* Form fields */}
</form>
```

---

## Offline State Indicators

```tsx
<div 
  role="status" 
  aria-live="polite"
  className="offline-indicator"
>
  {!isOnline && (
    <>
      <WifiOff aria-hidden="true" />
      <span>You are offline. Changes will sync when connected.</span>
    </>
  )}
</div>
```

---

## Language Support

### Language Switcher

```tsx
<div role="group" aria-label="Select language">
  <Select
    value={language}
    onValueChange={setLanguage}
    aria-label="Language selection"
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {languages.map((lang) => (
        <SelectItem key={lang.code} value={lang.code}>
          <span lang={lang.code}>{lang.native}</span>
          <span className="sr-only">({lang.english})</span>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

### Content Language

```tsx
<html lang="en">
  {/* Or dynamically */}
  <html lang={currentLanguage}>
  
  {/* For multilingual content */}
  <p>
    <span lang="en">Finger Millet</span>
    <span lang="hi">(रागी)</span>
  </p>
</html>
```

---

## Skip Links

```tsx
// Add at the very beginning of body
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:p-4 focus:rounded-lg"
>
  Skip to main content
</a>

// Mark main content
<main id="main-content" tabIndex={-1}>
  {/* Page content */}
</main>
```

---

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .animate-spin,
  .animate-pulse,
  .animate-bounce {
    animation: none !important;
  }
}
```

```tsx
// In Framer Motion
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

---

## Testing Checklist

### Automated Testing
- [ ] Run axe-core on all pages
- [ ] Check color contrast with WAVE
- [ ] Validate HTML with W3C validator

### Manual Testing
- [ ] Keyboard-only navigation through all flows
- [ ] Screen reader testing (NVDA, VoiceOver)
- [ ] 200% zoom testing
- [ ] Touch target size verification
- [ ] Focus indicator visibility
- [ ] Error message clarity

### User Testing
- [ ] Test with low-literacy users
- [ ] Test in field conditions (bright sunlight)
- [ ] Test with intermittent connectivity
- [ ] Test voice features with regional accents

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
