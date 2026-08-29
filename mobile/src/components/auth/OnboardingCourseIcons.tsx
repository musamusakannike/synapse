import React from 'react';
import Svg, { Path, Rect, Circle, G, Polygon } from 'react-native-svg';

interface IconProps {
  size?: number;
}

// -------------------------------------------------------------
// Screen 2: Interest Icons (Warm Orange / Gold Palette)
// -------------------------------------------------------------

export function GamesIcon({ size = 44 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect x="4" y="12" width="40" height="24" rx="10" fill="#FFA347" />
      <Path
        d="M20 24c0 3-2 5-4 5s-4-2-4-5 2-5 4-5 4 2 4 5zM36 24c0 3-2 5-4 5s-4-2-4-5 2-5 4-5 4 2 4 5z"
        fill="#FF6A00"
      />
      <Circle cx="16" cy="24" r="3.5" fill="#FFFFFF" opacity={0.9} />
      <Circle cx="32" cy="24" r="3.5" fill="#FFFFFF" opacity={0.9} />
      <Path d="M21 32c1.5-2 4.5-2 6 0" stroke="#CC5500" strokeWidth="2.5" strokeLinecap="round" />
      <Rect x="2" y="19" width="4" height="10" rx="2" fill="#E65A00" />
      <Rect x="42" y="19" width="4" height="10" rx="2" fill="#E65A00" />
    </Svg>
  );
}

export function AIProjectsIcon({ size = 44 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect x="6" y="8" width="36" height="32" rx="8" fill="#FFA347" />
      <Rect x="6" y="8" width="36" height="10" rx="4" fill="#E65A00" opacity={0.3} />
      {/* Code prompt >_ */}
      <Path
        d="M14 23l6 5-6 5"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M25 33h10" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
    </Svg>
  );
}

export function WebsitesIcon({ size = 44 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="22" cy="22" r="16" fill="#FFA347" />
      {/* Globe grid */}
      <Path
        d="M6 22h32M22 6c4 5 6 10 6 16s-2 11-6 16M22 6c-4 5-6 10-6 16s2 11 6 16"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Cursor arrow */}
      <G transform="translate(24, 22)">
        <Polygon points="0,0 0,16 5,12 9,20 12,18 8,11 14,11" fill="#E65A00" stroke="#FFFFFF" strokeWidth="1.5" />
      </G>
    </Svg>
  );
}

export function MobileAppIcon({ size = 44 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect x="13" y="6" width="22" height="36" rx="6" fill="#FFA347" />
      <Rect x="16" y="11" width="16" height="24" rx="3" fill="#FFE8CC" />
      <Rect x="20" y="8" width="8" height="2" rx="1" fill="#E65A00" opacity={0.5} />
      <Circle cx="24" cy="38" r="2" fill="#E65A00" />
    </Svg>
  );
}

// -------------------------------------------------------------
// Screen 3: Starter Course Tech Logos / Icons
// -------------------------------------------------------------

export function PythonIcon({ size = 38 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M23.5 4C14.5 4 15 8 15 8l.01 4h9v3H11s-5.5-.6-5.5 8.5 4.8 8.5 4.8 8.5h3.2v-4.5s-.2-5 5-5h8.5s4.8.1 4.8-4.7V10s.7-6-10.3-6zm-4.7 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"
        fill="#3776AB"
      />
      <Path
        d="M24.5 44c9 0 8.5-4 8.5-4l-.01-4h-9v-3H37s5.5.6 5.5-8.5-4.8-8.5-4.8-8.5h-3.2v4.5s.2 5-5 5H21s-4.8-.1-4.8 4.7V38s-.7 6 10.3 6zm4.7-3a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
        fill="#FFD43B"
      />
    </Svg>
  );
}

export function RoboticsIcon({ size = 38 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Robot Antenna */}
      <Circle cx="24" cy="7" r="3" fill="#F2A900" />
      <Path d="M24 10v4" stroke="#F2A900" strokeWidth="2.5" strokeLinecap="round" />
      {/* Robot Head */}
      <Rect x="8" y="14" width="32" height="24" rx="10" fill="#F5A623" />
      {/* Dark Visor */}
      <Rect x="12" y="18" width="24" height="12" rx="6" fill="#1C1C28" />
      {/* Glowing Eyes */}
      <Circle cx="18" cy="24" r="3" fill="#4DF0FF" />
      <Circle cx="30" cy="24" r="3" fill="#4DF0FF" />
      {/* Ears */}
      <Rect x="4" y="21" width="4" height="10" rx="2" fill="#E08A00" />
      <Rect x="40" y="21" width="4" height="10" rx="2" fill="#E08A00" />
      {/* Smile dots */}
      <Path d="M20 33h8" stroke="#1C1C28" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function DjangoIcon({ size = 38 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect x="6" y="6" width="36" height="36" rx="8" fill="#0C4B33" />
      {/* Stylized 'dj' */}
      <Path
        d="M20 14v16c0 3.5-2 5-5.5 5h-1.5v-3.5h1.2c1.8 0 2.8-.8 2.8-2.5V14H20zm7 7v10.5c0 1.2.5 1.8 1.8 1.8h2.2V37h-3.2c-3.2 0-4.8-1.5-4.8-4.5V21h4zm0-7v4h-4v-4h4z"
        fill="#44B78B"
      />
    </Svg>
  );
}

export function WebDevIcon({ size = 38 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="18" fill="#0284C7" />
      <Circle cx="24" cy="24" r="18" fill="url(#webdev-grad)" />
      {/* Code brackets </ > */}
      <Path
        d="M18 19l-5 5 5 5M30 19l5 5-5 5M26 17l-4 14"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BlockchainIcon({ size = 38 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Isometric 3D Cubes */}
      {/* Top Cube */}
      <G transform="translate(14, 4)">
        <Polygon points="10,0 20,5 10,10 0,5" fill="#8B5CF6" />
        <Polygon points="0,5 10,10 10,20 0,15" fill="#6D28D9" />
        <Polygon points="10,10 20,5 20,15 10,20" fill="#7C3AED" />
      </G>
      {/* Bottom Left Cube */}
      <G transform="translate(4, 20)">
        <Polygon points="10,0 20,5 10,10 0,5" fill="#60A5FA" />
        <Polygon points="0,5 10,10 10,20 0,15" fill="#2563EB" />
        <Polygon points="10,10 20,5 20,15 10,20" fill="#3B82F6" />
      </G>
      {/* Bottom Right Cube */}
      <G transform="translate(24, 20)">
        <Polygon points="10,0 20,5 10,10 0,5" fill="#818CF8" />
        <Polygon points="0,5 10,10 10,20 0,15" fill="#4338CA" />
        <Polygon points="10,10 20,5 20,15 10,20" fill="#4F46E5" />
      </G>
    </Svg>
  );
}

export function PromptEngineeringIcon({ size = 38 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* AI Bot Head with glowing sparks */}
      <Rect x="10" y="14" width="28" height="24" rx="8" fill="#3B82F6" />
      <Rect x="14" y="18" width="20" height="12" rx="4" fill="#1E293B" />
      <Circle cx="19" cy="24" r="2.5" fill="#60A5FA" />
      <Circle cx="29" cy="24" r="2.5" fill="#60A5FA" />
      {/* Lightbulb Spark at top right */}
      <Circle cx="35" cy="11" r="5" fill="#F59E0B" />
      <Path d="M35 3v3M43 11h-3M41 5l-2 2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      {/* Speech Bubble icon bottom left */}
      <Rect x="5" y="28" width="12" height="10" rx="3" fill="#8B5CF6" />
      <Polygon points="8,38 12,38 9,41" fill="#8B5CF6" />
    </Svg>
  );
}

// -------------------------------------------------------------
// Screen 4: Goal Clock Icon
// -------------------------------------------------------------

export function GoalClockIcon({ size = 44 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Orange circle with hands */}
      <Circle cx="24" cy="24" r="18" fill="#FFE8CC" stroke="#FF8A1E" strokeWidth="3" />
      <Path
        d="M24 14v10l7 4"
        stroke="#FF8A1E"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="24" cy="24" r="2.5" fill="#FF8A1E" />
    </Svg>
  );
}
