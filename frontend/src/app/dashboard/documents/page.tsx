"use client";

import React, { useEffect, useState, useRef } from "react";
import { DocumentAPI } from "@/lib/api";
import { UploadCloud, RefreshCw, Trash2, SendHorizontal, Menu, X } from "lucide-react";
import Loader from "@/components/Loader";
import HelpButton from "@/components/HelpButton";
import { helpConfigs } from "@/config/helpConfigs";
import Chat from "@/components/Chat";

type Doc = {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  summary?: string;
  processingStatus?: "pending" | "processing" | "completed" | "failed";
  processingError?: string;
  createdAt?: string;
  content?: string; 
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null!);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await DocumentAPI.list();
      setDocs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  useEffect(() => {
    // Close sidebar when a document is selected on small screens and reset messages for new context
    if (selectedDoc) {
      setSidebarOpen(false);
      setMessages([]);
    }
  }, [selectedDoc]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      await DocumentAPI.upload(fd);
      setFile(null);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const doSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedDoc) return;
    try {
      setSending(true);
      const content = prompt.trim();
      setMessages((prev) => [...prev, { role: "user", content }]);
      setPrompt("");

      setMessages((prev) => [...prev, { role: "assistant", content: "typing__placeholder__" }]);

      const { data } = await DocumentAPI.chat(selectedDoc._id, content);
      const aiResponse = data?.aiResponse || { role: "assistant", content: "Sorry, I couldn't process that." };

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = aiResponse;
        return newMessages;
      });

      setSending(false);
    } catch (e) {
      console.error(e);
      setSending(false);
    }
  };
  
  const onTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 220)}px`;
    }
  };

  const onTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Trigger submit if allowed
      if (prompt.trim() && !sending && selectedDoc) {
        // Manually call doSend-like flow by submitting the form
        (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
      }
    }
  };
  
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };
  
  const statusBadge = (status?: Doc["processingStatus"]) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
      processing: "bg-blue-50 text-blue-700 ring-blue-600/20",
      completed: "bg-green-50 text-green-700 ring-green-600/20",
      failed: "bg-red-50 text-red-700 ring-red-600/20",
    };
    const label = status ?? "completed";
    const cls = map[label] ?? map["completed"];
    return <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium ring-1 ring-inset ${cls}`}>{label}</span>;
  };
  
  const remove = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      setActionId(id);
      await DocumentAPI.delete(id);
      setDocs((prev) => prev.filter((d) => d._id !== id));
      if (selectedDoc?._id === id) {
        setSelectedDoc(null);
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar (Left) */}
      <div className="hidden lg:block w-72 border-r border-gray-200 p-4 space-y-4">
        <h2 className="text-lg font-semibold">Your Documents</h2>
        <button
          onClick={load}
          className="w-full text-sm text-gray-600 hover:text-gray-900 inline-flex items-center justify-center gap-2 p-2 border rounded"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        {loading ? (
          <Loader />
        ) : (
          <div className="space-y-2">
            {docs.length === 0 && (
              <p className="text-xs text-gray-500">No documents yet. Use the upload button below to add one.</p>
            )}
            {docs.map((doc) => (
              <div
                key={doc._id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-2 rounded cursor-pointer border ${selectedDoc?._id === doc._id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-transparent"}`}
              >
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate flex-1" title={doc.originalName}>{doc.originalName}</p>
                  {statusBadge(doc.processingStatus)}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">{formatSize(doc.size)}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(doc._id);
                    }}
                    disabled={actionId === doc._id}
                    className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1"
                    aria-label={`Delete ${doc.originalName}`}
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[80%] bg-white border-r border-gray-200 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Documents</h2>
              <button className="p-2 rounded hover:bg-gray-100" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                <X className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={load}
              className="w-full text-sm text-gray-600 hover:text-gray-900 inline-flex items-center justify-center gap-2 p-2 border rounded"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            {loading ? (
              <Loader />
            ) : (
              <div className="space-y-2">
                {docs.length === 0 && (
                  <p className="text-xs text-gray-500">No documents yet. Use the upload button below to add one.</p>
                )}
                {docs.map((doc) => (
                  <div
                    key={doc._id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-2 rounded cursor-pointer border ${selectedDoc?._id === doc._id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-transparent"}`}
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate flex-1" title={doc.originalName}>{doc.originalName}</p>
                      {statusBadge(doc.processingStatus)}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">{formatSize(doc.size)}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(doc._id);
                        }}
                        disabled={actionId === doc._id}
                        className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1"
                        aria-label={`Delete ${doc.originalName}`}
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between lg:hidden p-3 border-b border-gray-200">
          <button className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu className="w-5 h-5" />
            <span className="text-sm">Documents</span>
          </button>
          {selectedDoc && <span className="text-sm text-gray-600 truncate max-w-[60%]" title={selectedDoc.originalName}>{selectedDoc.originalName}</span>}
        </div>

        <div className="flex-1 p-4 overflow-y-auto pb-32">
          {selectedDoc ? (
            <div>
              <h1 className="hidden lg:block text-2xl font-bold truncate" title={selectedDoc.originalName}>{selectedDoc.originalName}</h1>
              <div className="mt-4">
                <Chat summary={selectedDoc.summary} messages={messages} sending={sending} messagesEndRef={messagesEndRef} />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-10">
              <p>Select a document to start chatting.</p>
            </div>
          )}
        </div>

        {/* Fixed bottom input */}
        <div className="fixed left-0 right-0 bottom-0 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="max-w-4xl mx-auto px-3 py-3">
            <form onSubmit={doSend} className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md"
                aria-label="Choose file"
              >
                <UploadCloud className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.txt,.md,.csv,.json,.pptx"
              />
              <button
                type="button"
                onClick={onUpload}
                disabled={!file || uploading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md disabled:opacity-50"
              >
                {uploading ? <Loader /> : 'Upload'}
              </button>
              {file && (
                <span className="hidden sm:inline text-xs text-gray-600 truncate max-w-[25%]" title={file.name}>
                  {file.name} · {formatSize(file.size)}
                </span>
              )}
              <textarea
                ref={textAreaRef}
                value={prompt}
                onChange={onTextAreaChange}
                onKeyDown={onTextAreaKeyDown}
                placeholder={selectedDoc ? "Ask a question about the document..." : "Select a document to start chatting"}
                className="flex-1 resize-none border border-gray-200 rounded-md px-3 py-2 max-h-56 min-h-10 focus:outline-none focus:ring-2 focus:ring-blue-100"
                rows={1}
                disabled={!selectedDoc}
              />
              <button
                type="submit"
                disabled={!prompt.trim() || sending || !selectedDoc}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                aria-label="Send message"
              >
                {sending ? <Loader /> : <SendHorizontal className="w-4 h-4" />}
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <HelpButton helpConfig={helpConfigs.documents} />
    </div>
  );
}