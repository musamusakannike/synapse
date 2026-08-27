import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Course Social Preview';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: '#0F172A',
          backgroundImage: 'linear-gradient(to bottom right, #0F172A, #1E1B4B)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '60px',
          color: '#FAFAF9',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              padding: '8px 20px',
              borderRadius: '999px',
              backgroundColor: '#EAB308',
              color: '#09090B',
              fontWeight: 'bold',
              fontSize: '18px',
            }}
          >
            SabiLearn
          </div>
          <div
            style={{
              padding: '8px 20px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#FDE047',
              fontWeight: '600',
              fontSize: '18px',
            }}
          >
            Interactive Course
          </div>
        </div>

        <div
          style={{
            fontSize: '52px',
            fontWeight: 'bold',
            lineHeight: 1.25,
            marginBottom: '20px',
            color: '#FFFFFF',
            maxWidth: '1000px',
          }}
        >
          Master Skills with Step-by-Step Chapters & Exercises
        </div>

        <div style={{ fontSize: '24px', color: '#CBD5E1', maxWidth: '900px', lineHeight: 1.5 }}>
          Earn dynamic XP, track your progress, and practice with AI guidance on SabiLearn.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
