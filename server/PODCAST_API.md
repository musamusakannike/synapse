# Podcast Generation API Documentation

## Overview

The Synapse AI Podcast Generation feature allows users to convert articles into engaging podcast scripts and audio files using Google's Gemini AI for script generation and Google Cloud Text-to-Speech for audio conversion.

## Authentication

All endpoints (except audio download) require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Generate Podcast Script Only

**POST** `/api/podcast/script`

Generate a podcast script from an article without converting to audio.

**Request Body:**
```json
{
  "articleTitle": "Article Title",
  "articleContent": "Full article content...",
  "podcastStyle": "professional" // optional: "professional", "casual", "energetic", "educational"
}
```

**Response:**
```json
{
  "script": "Generated podcast script...",
  "articleTitle": "Article Title",
  "podcastStyle": "professional",
  "wordCount": 350,
  "estimatedDuration": "3 minutes",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### 2. Convert Script to Audio

**POST** `/api/podcast/audio`

Convert an existing script to audio using Google Cloud TTS.

**Request Body:**
```json
{
  "script": "Podcast script text...",
  "voiceGender": "NEUTRAL", // optional: "NEUTRAL", "MALE", "FEMALE"
  "voiceSpeed": 1.0,        // optional: 0.25 to 4.0
  "voicePitch": 0.0         // optional: -20.0 to 20.0
}
```

**Response:**
```json
{
  "audioId": "unique_audio_id",
  "downloadUrl": "http://localhost:5000/api/podcast/download/unique_audio_id",
  "fileName": "podcast_unique_id.mp3",
  "fileSize": "2.5 MB",
  "voiceSettings": {
    "gender": "NEUTRAL",
    "speed": 1.0,
    "pitch": 0.0
  },
  "timestamp": "2024-01-20T10:35:00.000Z"
}
```

### 3. Generate Complete Podcast (Script + Audio)

**POST** `/api/podcast/generate`

Generate both script and audio in one request. This is the recommended endpoint for full podcast generation.

**Request Body:**
```json
{
  "articleTitle": "Article Title",
  "articleContent": "Full article content...",
  "podcastStyle": "professional",  // optional
  "voiceGender": "NEUTRAL",        // optional
  "voiceSpeed": 1.0,               // optional
  "voicePitch": 0.0                // optional
}
```

**Response:**
```json
{
  "podcastId": "mongodb_document_id",
  "script": "Generated podcast script...",
  "audioId": "unique_audio_id",
  "downloadUrl": "http://localhost:5000/api/podcast/download/unique_audio_id",
  "fileName": "podcast_unique_id.mp3",
  "fileSize": "2.5 MB",
  "articleTitle": "Article Title",
  "podcastStyle": "professional",
  "voiceSettings": {
    "gender": "NEUTRAL",
    "speed": 1.0,
    "pitch": 0.0
  },
  "wordCount": 350,
  "estimatedDuration": "3 minutes",
  "generationTime": "5432ms",
  "timestamp": "2024-01-20T10:40:00.000Z"
}
```

### 4. Get Podcast History

**GET** `/api/podcast/history?page=1&limit=10`

Retrieve user's podcast generation history with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "podcasts": [
    {
      "_id": "podcast_document_id",
      "articleTitle": "Article Title",
      "script": "Generated script...",
      "podcastStyle": "professional",
      "voiceSettings": { /* voice settings */ },
      "audioMetadata": { /* audio file info */ },
      "analytics": { /* generation analytics */ },
      "status": "audio_generated",
      "createdAt": "2024-01-20T10:40:00.000Z",
      "updatedAt": "2024-01-20T10:40:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalDocs": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 5. Get Podcast by ID

**GET** `/api/podcast/:podcastId`

Retrieve a specific podcast by its ID.

**Response:**
```json
{
  "podcast": {
    "_id": "podcast_document_id",
    "user": {
      "name": "User Name",
      "email": "user@example.com"
    },
    "articleTitle": "Article Title",
    "articleContent": "Full article content...",
    "script": "Generated script...",
    "podcastStyle": "professional",
    "voiceSettings": { /* voice settings */ },
    "audioMetadata": { /* audio file info */ },
    "analytics": { /* generation analytics */ },
    "status": "audio_generated",
    "createdAt": "2024-01-20T10:40:00.000Z",
    "updatedAt": "2024-01-20T10:40:00.000Z"
  }
}
```

### 6. Delete Podcast

**DELETE** `/api/podcast/:podcastId`

Delete a specific podcast and its associated audio file.

**Response:**
```json
{
  "message": "Podcast deleted successfully",
  "deletedPodcastId": "podcast_document_id"
}
```

### 7. Download Audio File

**GET** `/api/podcast/download/:audioId`

Download the generated audio file. No authentication required.

**Response:**
- Content-Type: `audio/mpeg`
- Content-Disposition: `attachment; filename="podcast_unique_id.mp3"`
- Binary MP3 audio data

## Podcast Styles

- **professional**: Clear, engaging tone suitable for news podcasts
- **casual**: Friendly, conversational tone as if talking to a friend
- **energetic**: Enthusiastic, upbeat tone with excitement
- **educational**: Informative tone that breaks down complex topics clearly

## Voice Settings

- **Gender**: NEUTRAL, MALE, FEMALE
- **Speed**: 0.25 to 4.0 (1.0 = normal speed)
- **Pitch**: -20.0 to 20.0 (0.0 = normal pitch)

## Error Responses

All endpoints return standard HTTP status codes:

- **400 Bad Request**: Missing required parameters
- **401 Unauthorized**: Invalid or missing JWT token
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server or external API error

Example error response:
```json
{
  "message": "Article title and content are required",
  "stack": "Error stack trace (in development mode)"
}
```

## File Storage

- Audio files are temporarily stored in the server's `temp/` directory
- Files are automatically cleaned up after 30 minutes
- Database records persist indefinitely (until manually deleted)

## Prerequisites

1. **Google Cloud TTS**: Requires Google Cloud Text-to-Speech API credentials
2. **Gemini AI**: Requires GEMINI_API_KEY environment variable
3. **MongoDB**: Database for storing podcast metadata

## Environment Variables Required

```
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/google-cloud-credentials.json
```