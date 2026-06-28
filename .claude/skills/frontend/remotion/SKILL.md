---
name: remotion
description: "Remotion expert for creating programmatic videos with React. Use when building video compositions, animations, sequences, transitions, captions, or any video rendering in Career Pilot."
triggers: remotion, video, composition, sequence, animation, frame, fps, duration, interpolate, spring, audio, captions, render, mp4, gif
---

# Remotion — Career Pilot

Expert in Remotion for creating programmatic React-based videos — resume walkthrough videos, career tip clips, onboarding animations, and marketing content.

## Core Concepts

- **Composition**: A video component with defined width, height, fps, and durationInFrames
- **useCurrentFrame()**: Returns the current frame number (0-indexed)
- **useVideoConfig()**: Returns fps, width, height, durationInFrames
- **interpolate()**: Maps a frame range to an output range (opacity, position, scale)
- **spring()**: Physics-based animation that feels natural
- **Sequence**: Places children at a specific start frame with optional duration
- **Series**: Chains sequences back-to-back automatically

## MUST DO

- Define every Composition with explicit `width`, `height`, `fps`, and `durationInFrames`
- Use `interpolate()` with `extrapolateLeft: 'clamp'` and `extrapolateRight: 'clamp'` to prevent values going out of range
- Use `spring()` for natural-feeling motion (scale, position entrances)
- Use `<Sequence>` to organize timeline — never manually offset with frame math
- Use `<Series>` when clips play back-to-back with no overlap
- Use `staticFile()` for assets in the `/public` folder — never hardcode paths
- Use `<AbsoluteFill>` as the root layout container
- Use `<Img>` from `remotion` instead of `<img>` for images
- Use `<Audio>` and `<Video>` from `remotion` for media — never native HTML elements
- Register all compositions in `Root.tsx` using `<Composition>`
- Use `delayRender()` / `continueRender()` for async data loading

## MUST NOT

- Use `setTimeout`, `setInterval`, or `requestAnimationFrame` — everything is frame-based
- Use CSS animations or `transition` — use `interpolate()` or `spring()` driven by frame
- Use `useEffect` to trigger animations — derive everything from the current frame
- Hardcode frame numbers across components — pass props or use Sequence offsets
- Use `Math.random()` — it breaks deterministic rendering (use `random()` from `remotion`)
- Forget `extrapolateLeft/Right: 'clamp'` on interpolate — values will overshoot

## Animation Patterns

### Fade In
```tsx
const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
return <AbsoluteFill style={{ opacity }}>...</AbsoluteFill>;
```

### Spring Scale
```tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const scale = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
return <div style={{ transform: `scale(${scale})` }}>...</div>;
```

### Slide In From Left
```tsx
const frame = useCurrentFrame();
const translateX = interpolate(frame, [0, 20], [-100, 0], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
return <div style={{ transform: `translateX(${translateX}%)` }}>...</div>;
```

### Staggered List
```tsx
{items.map((item, i) => (
  <Sequence from={i * 10} key={i}>
    <FadeIn><ItemCard data={item} /></FadeIn>
  </Sequence>
))}
```

## Composition Structure

```tsx
// Root.tsx
import { Composition } from 'remotion';
import { ResumeVideo } from './ResumeVideo';

export const RemotionRoot = () => (
  <>
    <Composition
      id="ResumeVideo"
      component={ResumeVideo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ resumeData: sampleData }}
    />
  </>
);
```

## Timeline Organization

```tsx
// Use Series for sequential clips
<Series>
  <Series.Sequence durationInFrames={90}>
    <IntroSlide name={data.name} title={data.title} />
  </Series.Sequence>
  <Series.Sequence durationInFrames={150}>
    <ExperienceSlide experiences={data.experience} />
  </Series.Sequence>
  <Series.Sequence durationInFrames={60}>
    <OutroSlide />
  </Series.Sequence>
</Series>
```

## Audio

```tsx
import { Audio, staticFile, interpolate, useCurrentFrame } from 'remotion';

// Background music with fade out
const frame = useCurrentFrame();
const { durationInFrames } = useVideoConfig();
const volume = interpolate(
  frame,
  [0, 30, durationInFrames - 30, durationInFrames],
  [0, 0.5, 0.5, 0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);

<Audio src={staticFile('bgm.mp3')} volume={volume} />
```

## Rendering

```bash
# Preview in browser
npx remotion studio

# Render to MP4
npx remotion render ResumeVideo out/resume.mp4

# Render to GIF
npx remotion render ResumeVideo out/resume.gif --image-format=png

# Render specific frames
npx remotion render ResumeVideo out/resume.mp4 --frames=0-90
```

## Career Pilot Use Cases

- Resume walkthrough videos (animate each section of a resume)
- Career tip short-form videos (social media clips)
- Onboarding tutorial videos
- Template preview animations
- Marketing/promo videos for landing page
