import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SabiLearn — Learn a skill. Sabi it for life.',
    short_name: 'SabiLearn',
    description: 'Courses, interactive exercises, practice quizzes, and AI study tools built for Nigerian learners.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF9F7',
    theme_color: '#F8BE43',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
