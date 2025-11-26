// App.jsx
import { useAuth } from "./AuthContext";
import BookReels from "./BookReels";

export default function App() {
  const { user, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* 🔥 Remount BookReels when user changes */}
      <BookReels key={user ? user.uid : "guest"} />

      {/* AUTH & PROFILE CONTROLS */}
      <div className="fixed top-14 right-5 z-[500] flex items-center gap-3">

        {!user && (
          <button
            onClick={login}
            className="bg-white/10 backdrop-blur-md text-white px-3 py-2 text-sm 
                       rounded-lg hover:bg-white/20 transition"
          >
            Sign in
          </button>
        )}

        {user && (
          <>
            {/* Profile drawer button */}
            <button
              onClick={() => {
                const event = new CustomEvent("open-profile-drawer");
                window.dispatchEvent(event);
              }}
              className="bg-white/10 backdrop-blur-md text-white px-3 py-2 text-sm 
                         rounded-lg hover:bg-white/20 transition"
            >
              Profile
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 text-sm 
                         rounded-lg hover:bg-white/30 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </>
  );
}
