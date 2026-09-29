import { useState, useEffect } from "react";
import PageHeaderBanner from "../components/PageHeaderBanner";
import { communityApi } from "../api";
import { STORAGE_KEYS } from "../utils";

import "./Community.css";

const CATEGORIES = [
  "All",
  "Balcony Gardens",
  "Pest & Care Tips",
  "Plant Showcases",
  "DIY & Compost",
  "Beginner Q&A",
];

const POPULAR_TAGS = [
  "Tomato",
  "Mint",
  "Rose",
  "Basil (Tulsi)",
  "Aloe Vera",
  "Curry Leaf",
  "Coriander",
  "Snake Plant",
];

function Community({ onPageChange }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // "recent" | "popular"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [toastMsg, setToastMsg] = useState(null);

  // Form state
  const [formCategory, setFormCategory] = useState("Balcony Gardens");
  const [formPlantTag, setFormPlantTag] = useState("Tomato");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current session user
  const session = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null") || {};
    } catch {
      return {};
    }
  })();
  const currentUserName = session?.name || "Gardener";
  const currentUserEmail = session?.email || "gardener@gardenguide.local";

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await communityApi.list({
        category: selectedCategory === "All" ? "" : selectedCategory,
        q: searchQuery,
        sort: sortBy,
      });
      if (res?.posts) {
        setPosts(res.posts);
      }
    } catch (err) {
      console.warn("Could not load remote community posts, using local cache:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPosts();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, sortBy]);

  // Handle Like
  const handleLike = async (postId) => {
    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            const liked = p.likedBy?.includes(currentUserEmail);
            const newLikedBy = liked
              ? (p.likedBy || []).filter((e) => e !== currentUserEmail)
              : [...(p.likedBy || []), currentUserEmail];
            return {
              ...p,
              likes: liked ? Math.max(0, p.likes - 1) : p.likes + 1,
              likedBy: newLikedBy,
            };
          }
          return p;
        })
      );

      await communityApi.like(postId, currentUserEmail);
    } catch (err) {
      console.error("Like failed:", err);
      showToast("Unable to save like. Please try again.");
    }
  };

  // Toggle comments
  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Add Comment
  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    try {
      const res = await communityApi.comment(postId, {
        text,
        authorName: currentUserName,
      });

      if (res?.post) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? res.post : p))
        );
      }
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      showToast("💬 Reply posted!");
    } catch (err) {
      console.error("Comment failed:", err);
      showToast("Unable to post comment.");
    }
  };

  // Create Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim() || formTitle.trim().length < 5) {
      setFormError("Please enter a title of at least 5 characters.");
      return;
    }

    if (!formContent.trim() || formContent.trim().length < 15) {
      setFormError("Please describe your question or tip in more detail (at least 15 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await communityApi.create({
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        plantTag: formPlantTag,
        authorName: currentUserName,
      });

      if (res?.post) {
        setPosts((prev) => [res.post, ...prev]);
        showToast("🌿 Post published to Community!");
        setIsModalOpen(false);
        setFormTitle("");
        setFormContent("");
      }
    } catch (err) {
      setFormError(err.message || "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "recently";
    const date = new Date(dateStr);
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  return (
    <main className="community-page">
      <PageHeaderBanner
        showBackButton={true}
        onPageChange={onPageChange}
        backFallbackPage="dashboard"
        eyebrow="URBAN BOTANICAL NETWORK & FORUM"
        title="Community Hub"
        titleAccent="👥"
        subtitle="Connect with fellow urban growers, share plant triumphs, exchange organic solutions, and ask questions."
        badgeIcon="🌱"
        badgeTitle="50,000+ Active Growers"
        badgeSubtitle="Balconies • Terraces • Indoor Spaces"
      />

      <div className="community-container">
        {/* Main Feed Column */}
        <section className="community-main">
          {/* Top Actions Bar */}
          <div className="community-actions-bar animate-slow-pop">
            <div className="community-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="search"
                placeholder="Search community tips, questions, plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search community posts"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              className="create-post-btn slow-pop-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <span>✍️</span>
              <span>Share Tip or Question</span>
            </button>
          </div>

          {/* Category Filter Pills & Sort Selector */}
          <div className="community-filter-row">
            <div className="category-pills-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="sort-buttons-wrap">
              <button
                type="button"
                className={`sort-pill ${sortBy === "recent" ? "active" : ""}`}
                onClick={() => setSortBy("recent")}
              >
                🕒 Recent
              </button>
              <button
                type="button"
                className={`sort-pill ${sortBy === "popular" ? "active" : ""}`}
                onClick={() => setSortBy("popular")}
              >
                🔥 Popular
              </button>
            </div>
          </div>

          {/* Posts List */}
          {loading && posts.length === 0 ? (
            <div className="community-loading-state">
              <span className="loading-spinner-sprout">🌱</span>
              <p>Gathering garden discussions...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="community-empty-state">
              <div className="empty-icon">🪴</div>
              <h3>No discussions found</h3>
              <p>
                {searchQuery
                  ? `No posts matching "${searchQuery}". Try a different keyword.`
                  : "Be the first to share a garden tip or question in this topic!"}
              </p>
              <button
                type="button"
                className="btn-empty-create"
                onClick={() => setIsModalOpen(true)}
              >
                Start a Discussion →
              </button>
            </div>
          ) : (
            <div className="posts-feed">
              {posts.map((post) => {
                const isLiked = post.likedBy?.includes(currentUserEmail);
                const areCommentsOpen = expandedComments[post._id];
                const commentsCount = post.comments?.length || 0;

                return (
                  <article key={post._id} className="post-card fade-in-up">
                    {/* Post Header */}
                    <div className="post-header">
                      <div className="post-author-box">
                        <div className="author-avatar">
                          {post.author?.avatar || post.author?.name?.slice(0, 1) || "🌿"}
                        </div>
                        <div className="author-meta">
                          <strong className="author-name">{post.author?.name || "Gardener"}</strong>
                          <span className="author-role-badge">{post.author?.role || "Urban Grower"}</span>
                        </div>
                      </div>
                      <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
                    </div>

                    {/* Post Badges */}
                    <div className="post-tags-row">
                      <span className="post-category-tag">{post.category}</span>
                      {post.plantTag && post.plantTag !== "General" && (
                        <span className="post-plant-tag">🌿 {post.plantTag}</span>
                      )}
                    </div>

                    {/* Post Title & Content */}
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-content-text">{post.content}</p>

                    {/* Post Actions */}
                    <div className="post-footer-actions">
                      <button
                        type="button"
                        className={`post-action-btn like-btn ${isLiked ? "liked" : ""}`}
                        onClick={() => handleLike(post._id)}
                        aria-label="Like post"
                      >
                        <span className="action-icon">{isLiked ? "❤️" : "🤍"}</span>
                        <span>{post.likes || 0}</span>
                      </button>

                      <button
                        type="button"
                        className={`post-action-btn comment-btn ${areCommentsOpen ? "active" : ""}`}
                        onClick={() => toggleComments(post._id)}
                        aria-label="View comments"
                      >
                        <span className="action-icon">💬</span>
                        <span>{commentsCount} {commentsCount === 1 ? "Comment" : "Comments"}</span>
                      </button>
                    </div>

                    {/* Comments Drawer */}
                    {areCommentsOpen && (
                      <div className="comments-drawer">
                        <div className="comments-divider"></div>

                        {/* Existing comments */}
                        {commentsCount === 0 ? (
                          <div className="comments-empty">
                            No comments yet. Share your experience or tip!
                          </div>
                        ) : (
                          <div className="comments-list">
                            {post.comments.map((c, idx) => (
                              <div key={c._id || idx} className="comment-item">
                                <div className="comment-avatar">
                                  {c.author?.slice(0, 1).toUpperCase() || "🧑‍🌾"}
                                </div>
                                <div className="comment-body">
                                  <div className="comment-header">
                                    <strong className="comment-author">{c.author}</strong>
                                    <span className="comment-time">{formatTimeAgo(c.createdAt)}</span>
                                  </div>
                                  <p className="comment-text">{c.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add comment input */}
                        <form
                          className="add-comment-form"
                          onSubmit={(e) => handleAddComment(post._id, e)}
                        >
                          <input
                            type="text"
                            placeholder="Add a helpful reply or follow-up question..."
                            value={commentInputs[post._id] || ""}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post._id]: e.target.value,
                              }))
                            }
                            className="comment-input"
                          />
                          <button
                            type="submit"
                            className="btn-comment-submit"
                            disabled={!(commentInputs[post._id] || "").trim()}
                          >
                            Reply
                          </button>
                        </form>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Sidebar Info Column */}
        <aside className="community-sidebar">
          {/* Quick Share Card */}
          <div className="community-side-card promo-card">
            <div className="side-card-icon">🌿</div>
            <h4>Have a Garden Victory?</h4>
            <p>
              Did your cherry tomatoes ripen? Did you save a plant from aphids? Share your photos and methods with 50K+ growers.
            </p>
            <button
              type="button"
              className="btn-side-share"
              onClick={() => setIsModalOpen(true)}
            >
              Post Your Story →
            </button>
          </div>

          {/* Plant Discussion Tags */}
          <div className="community-side-card">
            <h4>🌿 Trending Plant Topics</h4>
            <div className="tags-cloud">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="tag-chip"
                  onClick={() => setSearchQuery(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="community-side-card guidelines-card">
            <h4>🛡️ Community Values</h4>
            <ul className="guidelines-list">
              <li>
                <span className="guide-bullet">🌱</span>
                <span><strong>Be encouraging:</strong> Every urban grower starts with a single seed.</span>
              </li>
              <li>
                <span className="guide-bullet">🍃</span>
                <span><strong>Eco-friendly solutions:</strong> Prioritize natural & organic remedies whenever possible.</span>
              </li>
              <li>
                <span className="guide-bullet">🏡</span>
                <span><strong>Share context:</strong> Mention sunlight, container size, and local climate for better answers.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="create-post-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-icon">✍️</span>
                <h2 id="modal-title">Share with the Garden Community</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="modal-form">
              {formError && (
                <div className="modal-error-alert" role="alert">
                  <span>⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-row-dual">
                <div className="form-field">
                  <label htmlFor="post-category">Topic Category *</label>
                  <select
                    id="post-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    required
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="post-plant">Related Plant Species</label>
                  <select
                    id="post-plant"
                    value={formPlantTag}
                    onChange={(e) => setFormPlantTag(e.target.value)}
                  >
                    <option value="General">General / All Plants</option>
                    {POPULAR_TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="post-title">Discussion Title *</label>
                <input
                  id="post-title"
                  type="text"
                  placeholder="e.g. How I grew sweet cherry tomatoes on my 4th-floor balcony"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <div className="label-with-counter">
                  <label htmlFor="post-content">Your Tip, Story, or Question *</label>
                  <span className="char-counter">{formContent.length} chars</span>
                </div>
                <textarea
                  id="post-content"
                  rows={5}
                  placeholder="Share details such as your pot size, sunlight hours, watering schedule, soil mix, or specific symptoms..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  required
                />
              </div>

              <div className="modal-author-note">
                <span>Posting as: <strong>{currentUserName}</strong> ({currentUserEmail})</span>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Publishing..." : "Publish Post 🌿"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="community-toast slow-popup">
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </main>
  );
}

export default Community;
