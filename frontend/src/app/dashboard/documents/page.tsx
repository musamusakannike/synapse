"use client";

import React, { useEffect, useState, useRef } from "react";
import { DocumentAPI } from "@/lib/api";
import { UploadCloud, RefreshCw, Trash2, SendHorizontal } from "lucide-react";
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

    } catch (e) {
      console.error(e);
      setSending(false);
    }
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
      {/* Left panel for document list */}
      <div className="w-1/4 border-r border-gray-200 p-4 space-y-4">
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
            {docs.map((doc) => (
              <div
                key={doc._id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-2 rounded cursor-pointer ${selectedDoc?._id === doc._id ? "bg-blue-100" : "hover:bg-gray-50"}`}
              >
                <p className="font-medium truncate">{doc.originalName}</p>
                <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        remove(doc._id);
                    }}
                    disabled={actionId === doc._id}
                    className="text-xs text-red-500 hover:text-red-700 mt-1"
                >
                    <Trash2 className="w-3 h-3 inline-block" /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right panel for chat and document view */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto pb-28">
          {selectedDoc ? (
            <div>
              <h1 className="text-2xl font-bold">{selectedDoc.originalName}</h1>
              <div className="mt-4">
                <Chat messages={messages} sending={sending} messagesEndRef={messagesEndRef} />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-10">
              <p>Select a document to start chatting.</p>
            </div>
          )}
        </div>

        {/* Fixed bottom input */}
        <div className="fixed left-0 right-0 bottom-0 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="max-w-4xl mx-auto px-3 py-3">
            <form onSubmit={doSend} className="flex items-end gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
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
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                    {uploading ? <Loader /> : 'Upload'}
                </button>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask a question about the document..."
                className="flex-1 resize-none border border-gray-200 rounded-md px-3 py-2 max-h-40 min-h-10 focus:outline-none focus:ring-2 focus:ring-blue-100"
                rows={1}
                disabled={!selectedDoc}
              />
              <button
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