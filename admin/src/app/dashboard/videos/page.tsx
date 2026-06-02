"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { formatDate } from "@/lib/utils";
import { Film, Trash2, Eye, Loader2, PlayCircle, Image as ImageIcon } from "lucide-react";

interface VideoRow {
  _id: string;
  title: string;
  topic: string;
  styleTheme: string;
  sceneCount: number;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

interface Scene {
  sceneNumber: number;
  visualPrompt: string;
  narrationText: string;
  duration?: number;
}

interface VideoDetail {
  _id: string;
  title: string;
  topic: string;
  styleTheme: string;
  scenes?: Scene[];
}

const columns = [
  { key: "title", label: "Video Title" },
  { key: "topic", label: "Topic" },
  { key: "user", label: "Created By" },
  { key: "styleTheme", label: "Theme Style" },
  { key: "scenes", label: "Scenes" },
  { key: "created", label: "Created" },
  { key: "actions", label: "" },
];

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedVideo, setSelectedVideo] = useState<VideoRow | null>(null);
  const [videoDetail, setVideoDetail] = useState<VideoDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Delete Modal
  const [deleteVideo, setDeleteVideo] = useState<VideoRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
      });
      const res = await fetch(`/api/admin/videos?${params}`);
      const data = await res.json();
      if (data.success) {
        setVideos(data.videos);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search]);

  const fetchVideoDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/videos/${id}`);
      const data = await res.json();
      if (data.success) {
        setVideoDetail(data.video);
      }
    } catch {
      // Silently fail
    }
    setLoadingDetail(false);
  };

  const handleDelete = async () => {
    if (!deleteVideo) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/videos/${deleteVideo._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteVideo(null);
        fetchVideos();
      }
    } catch {
      // Silently fail
    }
    setDeleting(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold">
          Videos
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Monitor and manage AI-generated storyboard learning videos.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={videos as unknown as Record<string, unknown>[]}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by video title or topic…"
        loading={loading}
        emptyMessage="No videos found."
        renderRow={(item) => {
          const video = item as unknown as VideoRow;
          return (
            <tr key={video._id}>
              <td>
                <div className="flex items-center gap-2 max-w-xs sm:max-w-sm md:max-w-md">
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0 text-[var(--accent)] border border-[var(--border-subtle)]">
                    <Film className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="font-medium text-[var(--text-primary)] block truncate" title={video.title}>
                      {video.title}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span className="text-xs text-[var(--text-secondary)] max-w-[150px] truncate block" title={video.topic}>
                  {video.topic}
                </span>
              </td>
              <td>
                <div className="text-xs">
                  <span className="font-medium block text-[var(--text-secondary)] truncate max-w-[120px]">
                    {video.userName}
                  </span>
                  <span className="text-[var(--text-muted)] block truncate max-w-[120px]">
                    {video.userEmail}
                  </span>
                </div>
              </td>
              <td>
                <span className="capitalize text-xs text-[var(--text-secondary)]">
                  {video.styleTheme}
                </span>
              </td>
              <td>
                <span className="badge badge-neutral text-xs font-semibold">
                  {video.sceneCount} Scenes
                </span>
              </td>
              <td className="text-xs">{formatDate(video.createdAt)}</td>
              <td>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedVideo(video);
                      fetchVideoDetail(video._id);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                    title="View details & script"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteVideo(video)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[rgba(248,113,113,0.1)] hover:text-[var(--danger)] transition-colors"
                    title="Delete video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        }}
      />

      {/* Video Details Modal */}
      <Modal
        open={!!selectedVideo}
        onClose={() => {
          setSelectedVideo(null);
          setVideoDetail(null);
        }}
        title="Video Storyboard & Script"
        maxWidth="max-w-2xl"
      >
        {selectedVideo && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] space-y-1">
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">{selectedVideo.title}</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Topic: <strong>{selectedVideo.topic}</strong> | Theme: <strong className="capitalize">{selectedVideo.styleTheme}</strong>
              </p>
              <p className="text-xs text-[var(--text-muted)] pt-0.5">
                Created by <strong>{selectedVideo.userName}</strong> ({selectedVideo.userEmail}) on {formatDate(selectedVideo.createdAt)}
              </p>
            </div>

            <div className="max-h-[350px] overflow-y-auto pr-1 space-y-4">
              {loadingDetail ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
                  <span className="text-xs text-[var(--text-muted)]">Loading scenes…</span>
                </div>
              ) : videoDetail?.scenes && videoDetail.scenes.length > 0 ? (
                videoDetail.scenes.map((scene, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                      <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded bg-[var(--bg-elevated)] flex items-center justify-center text-[10px] text-[var(--accent)] font-bold">
                          {scene.sceneNumber || idx + 1}
                        </span>
                        Scene Details
                      </span>
                      {scene.duration && (
                        <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
                          {scene.duration} seconds
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-[var(--accent)]" />
                          VISUAL PROMPT (IMAGE GENERATION)
                        </span>
                        <p className="text-xs text-[var(--text-secondary)] pl-4 leading-relaxed bg-[var(--bg-tertiary)] p-2 rounded-lg border border-[var(--border-subtle)]">
                          {scene.visualPrompt}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1">
                          <PlayCircle className="w-3 h-3 text-[var(--success)]" />
                          AUDIO NARRATION SCRIPT (VOICEOVER)
                        </span>
                        <p className="text-xs text-[var(--text-secondary)] pl-4 leading-relaxed bg-[var(--bg-tertiary)] p-2 rounded-lg border border-[var(--border-subtle)] italic">
                          "{scene.narrationText}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                  No scene storyboard details found for this video.
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-[var(--border-subtle)] pt-3 mt-4">
              <button
                onClick={() => {
                  setSelectedVideo(null);
                  setVideoDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteVideo}
        onClose={() => setDeleteVideo(null)}
        title="Delete Video"
      >
        {deleteVideo && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[rgba(248,113,113,0.05)] border border-[rgba(248,113,113,0.2)]">
              <p className="text-sm text-[var(--danger)] font-medium mb-1">
                ⚠️ Destructive action.
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Are you sure you want to permanently delete the video storyboard <strong>{deleteVideo.title}</strong>?
                This will remove the script and all storyboard scene descriptions from the database.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteVideo(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-[var(--danger)] hover:opacity-90 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Video
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
