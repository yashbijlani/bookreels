import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Bookmark,
  Share2,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";

import { useAuth } from "./AuthContext";
import { loadUserData, saveUserData } from "./firebase";

const PASSAGES = [
  {
    id: 1,
    text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
    book: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Classic Romance",
    color: "from-rose-900 to-pink-900",
  },

  {
    id: 2,
    text: "All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl, who had been a governess in their family, and she had announced to her husband that she could not go on living in the same house with him.",
    book: "Anna Karenina",
    author: "Leo Tolstoy",
    genre: "Literary Fiction",
    color: "from-slate-800 to-slate-900",
  },

  {
    id: 3,
    text: "Mother died today. Or, maybe, yesterday; I can’t be sure. The telegram from the Home says: 'Your mother passed away. Funeral tomorrow. Deep sympathy.' Which leaves the matter doubtful; it could have been yesterday.",
    book: "The Stranger",
    author: "Albert Camus",
    genre: "Philosophical Fiction",
    color: "from-orange-900 to-amber-950",
  },

  {
    id: 4,
    text: "It was a pleasure to burn. It was a special pleasure to see things eaten, to see things blackened and changed. With the brass nozzle in his fists, with this great python spitting its venomous kerosene upon the world, the blood pounded in his head, and his hands were the hands of some amazing conductor playing all the symphonies of blazing and burning to bring down the tatters and charcoal ruins of history.",
    book: "Fahrenheit 451",
    author: "Ray Bradbury",
    genre: "Dystopian Fiction",
    color: "from-red-900 to-orange-950",
  },

  {
    id: 5,
    text: "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.",
    book: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy Adventure",
    color: "from-blue-900 to-indigo-900",
  },

  {
    id: 6,
    text: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. 'Whenever you feel like criticizing anyone,' he told me, 'just remember that all the people in this world haven't had the advantages that you've had.'",
    book: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "American Classic",
    color: "from-emerald-900 to-teal-900",
  },

  {
    id: 7,
    text: "The sky above the port was the color of television, tuned to a dead channel. 'It's not like I'm using,' Case heard someone say, as he shouldered his way through the crowd around the door of the Chat. 'It's like my body's developed this massive drug deficiency.' It was a Sprawl voice and a Sprawl joke.",
    book: "Neuromancer",
    author: "William Gibson",
    genre: "Cyberpunk",
    color: "from-purple-900 to-violet-950",
  },
];


export default function BookReels() {
  const { user } = useAuth();

  // UI + content state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [passages, setPassages] = useState(PASSAGES);

  // Cloud-synced state
  const [likes, setLikes] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [userPostsCloud, setUserPostsCloud] = useState([]);

  // Drawer state
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    text: "",
    book: "",
    author: "",
    genre: "",
    color: "from-indigo-900 to-purple-900",
  });

  // Refs for scrolling
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const scrollTimeout = useRef(null);

  // Cloud guard: avoid saving before we finish loading
  const [cloudLoaded, setCloudLoaded] = useState(false);

  // Reset cloud-related state when user changes
  useEffect(() => {
    setCloudLoaded(false);
    setLikes({});
    setBookmarks({});
    setUserPostsCloud([]);
    setPassages(PASSAGES);
  }, [user]);

  // EVENT LISTENER for profile drawer from App.jsx
  useEffect(() => {
    const openDrawer = () => setShowProfilePanel(true);
    window.addEventListener("open-profile-drawer", openDrawer);
    return () => window.removeEventListener("open-profile-drawer", openDrawer);
  }, []);

  //---------------------------------------------------------
  // CLOUD SYNC — Load user data on login / user change
  //---------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadCloud() {
      try {
        const cloud = await loadUserData(user.uid);
        if (cancelled) return;

        if (cloud) {
          setLikes(cloud.likes || {});
          setBookmarks(cloud.bookmarks || {});
          const posts = cloud.posts || [];
          setUserPostsCloud(posts);

          if (posts.length > 0) {
            setPassages([...PASSAGES, ...posts]);
          } else {
            setPassages(PASSAGES);
          }
        } else {
          // no cloud doc yet for this user
          setLikes({});
          setBookmarks({});
          setUserPostsCloud([]);
          setPassages(PASSAGES);
        }
      } finally {
        if (!cancelled) {
          setCloudLoaded(true);
        }
      }
    }

    loadCloud();

    return () => {
      cancelled = true;
    };
  }, [user]);

  //---------------------------------------------------------
  // CLOUD SYNC — Save likes to Firestore
  //---------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    if (!cloudLoaded) return; // don't write initial empty state
    saveUserData(user.uid, { likes });
  }, [likes, user, cloudLoaded]);

  //---------------------------------------------------------
  // CLOUD SYNC — Save bookmarks to Firestore
  //---------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    if (!cloudLoaded) return; // don't write initial empty state
    saveUserData(user.uid, { bookmarks });
  }, [bookmarks, user, cloudLoaded]);

  //---------------------------------------------------------
  // SCROLL + GESTURES LOGIC
  //---------------------------------------------------------
  const scrollToIndex = (index) => {
    if (index < 0 || index >= passages.length) return;
    setCurrentIndex(index);

    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: index * window.innerHeight,
        behavior: "smooth",
      });
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (scrollTimeout.current) return;

    if (e.deltaY > 0 && currentIndex < passages.length - 1) {
      scrollToIndex(currentIndex + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }

    scrollTimeout.current = setTimeout(() => {
      scrollTimeout.current = null;
    }, 600);
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < passages.length - 1) {
        scrollToIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        scrollToIndex(currentIndex - 1);
      }
    }
  };

  //---------------------------------------------------------
  // LIKES AND BOOKMARKS
  //---------------------------------------------------------
  const toggleLike = (id) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBookmark = (id) => {
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  //---------------------------------------------------------
  // ADD NEW PASSAGE (Cloud Sync)
  //---------------------------------------------------------
  const handleSubmitPassage = async (e) => {
    e.preventDefault();

    if (!formData.text.trim() || !formData.book.trim() || !formData.author.trim()) {
      alert("Please fill in text, book, and author.");
      return;
    }

    const newPassage = {
      id: Date.now(),
      text: formData.text,
      book: formData.book,
      author: formData.author,
      genre: formData.genre || "User Submitted",
      color: formData.color,
    };

    const newUserPosts = [...userPostsCloud, newPassage];
    setUserPostsCloud(newUserPosts);
    setPassages((prev) => [...prev, newPassage]);

    // Save to Firestore
    if (user && cloudLoaded) {
      await saveUserData(user.uid, { posts: newUserPosts });
    }

    setFormData({
      text: "",
      book: "",
      author: "",
      genre: "",
      color: "from-indigo-900 to-purple-900",
    });

    setShowAddForm(false);

    // scroll to the new passage
    setTimeout(() => {
      scrollToIndex(passages.length); // previous length is new index
    }, 200);
  };

  //---------------------------------------------------------
  // PROFILE DRAWER FILTERS
  //---------------------------------------------------------
  const myPosts = userPostsCloud;
  const likedPosts = passages.filter((p) => likes[p.id]);
  const savedPosts = passages.filter((p) => bookmarks[p.id]);

  //---------------------------------------------------------
  // RENDER START
  //---------------------------------------------------------
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* ========= LOGO ========= */}
      <div className="absolute top-4 left-4 z-30">
        <h1 className="text-white text-xl font-bold">BookReels</h1>
      </div>

      {/* ========= ADD PASSAGE BUTTON ========= */}
      {user && (
        <button
          onClick={() => setShowAddForm(true)}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/20 transition"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Add Passage
        </button>
      )}

      {/* ========= PROFILE DRAWER (LEFT SIDE) ========= */}
      {showProfilePanel && user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex justify-start">
          <div className="w-80 h-full bg-black p-6 overflow-y-auto border-r border-white/20">
            <button
              onClick={() => setShowProfilePanel(false)}
              className="text-white/70 hover:text-white mb-6"
            >
              ✕ Close
            </button>

            {/* User Info */}
            <div className="flex items-center gap-3 mb-6">
              <img
                src={user.photoURL}
                className="w-14 h-14 rounded-full border border-white/20"
                alt="profile"
              />
              <div>
                <p className="text-white font-semibold">{user.displayName}</p>
                <p className="text-white/60 text-sm">{user.email}</p>
              </div>
            </div>

            {/* My Posts */}
            <h2 className="text-white text-lg font-bold mb-2">My Posts</h2>
            {myPosts.length === 0 ? (
              <p className="text-white/40 mb-6">You have no posts yet.</p>
            ) : (
              myPosts.map((p) => (
                <div key={p.id} className="bg-white/10 p-4 rounded-lg mb-4">
                  <p className="font-serif mb-1">"{p.text}"</p>
                  <p className="text-sm">{p.book}</p>
                </div>
              ))
            )}

            {/* Liked */}
            <h2 className="text-white text-lg font-bold mb-2 mt-4">
              Liked Posts
            </h2>
            {likedPosts.length === 0 ? (
              <p className="text-white/40 mb-6">No liked posts.</p>
            ) : (
              likedPosts.map((p) => (
                <div key={p.id} className="bg-white/10 p-4 rounded-lg mb-4">
                  <p className="font-serif mb-1">"{p.text}"</p>
                  <p className="text-sm">{p.book}</p>
                </div>
              ))
            )}

            {/* Saved */}
            <h2 className="text-white text-lg font-bold mb-2 mt-4">
              Saved Posts
            </h2>
            {savedPosts.length === 0 ? (
              <p className="text-white/40">No saved posts.</p>
            ) : (
              savedPosts.map((p) => (
                <div key={p.id} className="bg-white/10 p-4 rounded-lg mb-4">
                  <p className="font-serif mb-1">"{p.text}"</p>
                  <p className="text-sm">{p.book}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========= ADD PASSAGE MODAL ========= */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[900] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-xl font-bold">Add New Passage</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitPassage} className="space-y-4">
              <textarea
                placeholder="Passage text..."
                className="w-full bg-white/10 text-white p-3 rounded-lg min-h-[120px]"
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
              />

              <input
                placeholder="Book"
                className="w-full bg-white/10 text-white p-3 rounded-lg"
                value={formData.book}
                onChange={(e) =>
                  setFormData({ ...formData, book: e.target.value })
                }
              />

              <input
                placeholder="Author"
                className="w-full bg-white/10 text-white p-3 rounded-lg"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
              />

              <input
                placeholder="Genre"
                className="w-full bg-white/10 text-white p-3 rounded-lg"
                value={formData.genre}
                onChange={(e) =>
                  setFormData({ ...formData, genre: e.target.value })
                }
              />

              <button
                type="submit"
                className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-white/80"
              >
                Add Passage
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========= MAIN FEED (Reels) ========= */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {passages.map((p, index) => (
          <div
            key={p.id}
            className="h-screen w-full snap-start flex items-center justify-center relative"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${p.color}`} />

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
              <p className="text-white text-2xl font-serif mb-6">
                "{p.text}"
              </p>
              <p className="text-white text-lg font-semibold">{p.book}</p>
              <p className="text-white text-md opacity-80">{p.author}</p>
              <p className="text-xs text-white/60 mt-2">{p.genre}</p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="absolute right-6 bottom-24 flex flex-col gap-6 z-20">
              <button onClick={() => toggleLike(p.id)}>
                <Heart
                  className={`w-6 h-6 ${
                    likes[p.id] ? "fill-red-500 text-red-500" : "text-white"
                  }`}
                />
              </button>

              <button onClick={() => toggleBookmark(p.id)}>
                <Bookmark
                  className={`w-6 h-6 ${
                    bookmarks[p.id]
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-white"
                  }`}
                />
              </button>

              <button>
                <Share2 className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* NAVIGATION ARROWS */}
            {index > 0 && (
              <button
                onClick={() => scrollToIndex(currentIndex - 1)}
                className="absolute top-8 left-1/2 -translate-x-1/2 text-white/50"
              >
                <ChevronUp className="w-8 h-8" />
              </button>
            )}
            {index < passages.length - 1 && (
              <button
                onClick={() => scrollToIndex(currentIndex + 1)}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
              >
                <ChevronDown className="w-8 h-8" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
