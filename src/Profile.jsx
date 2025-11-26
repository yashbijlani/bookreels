import { useAuth } from "./AuthContext";

export default function Profile({ passages, likes, userPosts, onBack }) {
  const { user } = useAuth();

  const likedPassages = passages.filter(p => likes[p.id]);
  const myPassages = userPosts;

  return (
    <div className="w-full h-screen bg-black text-white overflow-y-scroll p-6">
      <button
        onClick={onBack}
        className="mb-4 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20"
      >
        ← Back
      </button>

      <div className="flex items-center gap-4 mb-6">
        <img
          src={user.photoURL}
          className="w-16 h-16 rounded-full border border-white/40"
        />
        <div>
          <p className="text-xl font-semibold">{user.displayName}</p>
          <p className="text-sm text-white/70">{user.email}</p>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3">My Posts</h2>
      {myPassages.length === 0 ? (
        <p className="text-white/50 mb-6">You have not added any passages yet.</p>
      ) : (
        <div className="space-y-4 mb-8">
          {myPassages.map(p => (
            <div key={p.id} className="bg-white/10 p-4 rounded-xl">
              <p className="font-serif mb-2">"{p.text}"</p>
              <p className="text-sm">{p.book} — {p.author}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-bold mb-3">Saved Posts</h2>
      {likedPassages.length === 0 ? (
        <p className="text-white/50">No saved posts.</p>
      ) : (
        <div className="space-y-4">
          {likedPassages.map(p => (
            <div key={p.id} className="bg-white/10 p-4 rounded-xl">
              <p className="font-serif mb-2">"{p.text}"</p>
              <p className="text-sm">{p.book} — {p.author}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
