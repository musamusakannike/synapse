"use client";
import React, { useState, useEffect } from "react";
import {
  Globe,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import api from "@/lib/api";

interface Website {
  _id: string;
  url: string;
  title: string;
  description: string;
  content: string;
  status: "pending" | "completed" | "failed";
  lastScraped: string;
  createdAt: string;
}

const WebsitesPage = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const response = await api.get("/websites");
      setWebsites(response.data || []);
    } catch (error) {
      console.error("Failed to fetch websites:", error);
    } finally {
      setLoading(false);
    }
  };

  const addWebsite = async () => {
    if (!newUrl.trim()) return;

    // Basic URL validation
    try {
      new URL(newUrl);
    } catch {
      alert("Please enter a valid URL");
      return;
    }

    setAdding(true);
    try {
      const response = await api.post("/websites", { url: newUrl });
      setWebsites([response.data, ...websites]);
      setShowAddModal(false);
      setNewUrl("");
    } catch (error) {
      console.error("Failed to add website:", error);
      alert("Failed to add website. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const deleteWebsite = async (id: string) => {
    if (!confirm("Are you sure you want to delete this website?")) return;

    try {
      await api.delete(`/websites/${id}`);
      setWebsites(websites.filter(website => website._id !== id));
      if (selectedWebsite?._id === id) {
        setSelectedWebsite(null);
        setShowContentModal(false);
      }
    } catch (error) {
      console.error("Failed to delete website:", error);
      alert("Failed to delete website. Please try again.");
    }
  };

  const rescrapeWebsite = async (id: string) => {
    try {
      const response = await api.post(`/websites/${id}/rescrape`);
      setWebsites(websites.map(website => 
        website._id === id ? response.data : website
      ));
      if (selectedWebsite?._id === id) {
        setSelectedWebsite(response.data);
      }
    } catch (error) {
      console.error("Failed to rescrape website:", error);
      alert("Failed to rescrape website. Please try again.");
    }
  };

  const viewWebsiteContent = async (website: Website) => {
    try {
      const response = await api.get(`/websites/${website._id}`);
      setSelectedWebsite(response.data);
      setShowContentModal(true);
    } catch (error) {
      console.error("Failed to fetch website content:", error);
      alert("Failed to fetch website content. Please try again.");
    }
  };

  const filteredWebsites = websites.filter((website) =>
    website.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    website.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    website.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="min-h-screen flex overflow-x-hidden w-full py-2 lg:py-4">
      <Sidebar />
      <main className="flex-1 mx-auto overflow-y-auto bg-white border border-gray-200 lg:rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Websites</h1>
            <p className="text-gray-600 mt-1">
              Scrape and analyze web content for your studies
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span>Add Website</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search websites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Websites Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredWebsites.length === 0 ? (
          <div className="text-center py-16">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No websites found" : "No websites yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? "Try adjusting your search terms"
                : "Add your first website to start scraping web content"
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Add Website
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWebsites.map((website) => (
              <div
                key={website._id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {website.title || getDomainFromUrl(website.url)}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {getDomainFromUrl(website.url)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <a
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => rescrapeWebsite(website._id)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => deleteWebsite(website._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {website.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {website.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(website.status)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          website.status
                        )}`}
                      >
                        {website.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>
                      {website.lastScraped 
                        ? `Scraped ${formatDate(website.lastScraped)}`
                        : `Added ${formatDate(website.createdAt)}`
                      }
                    </span>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => viewWebsiteContent(website)}
                      disabled={website.status !== "completed"}
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        website.status === "completed"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {website.status === "completed" ? "View Content" : "Processing..."}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Website Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Website</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the URL of the website you want to scrape for content
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewUrl("");
                  }}
                  disabled={adding}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addWebsite}
                  disabled={adding || !newUrl.trim()}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    adding || !newUrl.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {adding ? "Adding..." : "Add Website"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Website Content Modal */}
        {showContentModal && selectedWebsite && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 truncate">
                    {selectedWebsite.title || getDomainFromUrl(selectedWebsite.url)}
                  </h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <a
                      href={selectedWebsite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                    >
                      <span className="truncate">{selectedWebsite.url}</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => setShowContentModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                >
                  ×
                </button>
              </div>
              
              <div className="prose max-w-none">
                {selectedWebsite.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedWebsite.description}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
                  <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedWebsite.content || "No content available."}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Last scraped: {formatDate(selectedWebsite.lastScraped || selectedWebsite.createdAt)}
                </div>
                <button
                  onClick={() => rescrapeWebsite(selectedWebsite._id)}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <RefreshCw size={16} />
                  <span>Rescrape</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WebsitesPage;
