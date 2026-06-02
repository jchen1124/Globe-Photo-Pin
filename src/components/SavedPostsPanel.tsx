import CloseIcon from "@mui/icons-material/Close";
import "../styles/SavedPostsPanel.css";

type SavedPost = {
  id: number;
  user_id: string;
  latitude: number;
  longitude: number;
  image_url: string;
  imageUrl: string | null;
  description: string;
  created_at: string;
  photo_date: string;
};

type SavedPostsPanelProps = {
  isOpen: boolean;
  posts: SavedPost[];
  onClose: () => void;
  onSelectPost: (post: SavedPost) => void;
};

const SavedPostsPanel = ({
  isOpen,
  posts,
  onClose,
  onSelectPost,
}: SavedPostsPanelProps) => {
  return (
    <aside
      className={`saved-posts-panel ${isOpen ? "saved-posts-panel-open" : ""}`}
      aria-hidden={!isOpen}
    >
      <div className="saved-posts-panel-header">
        <div>
          <p className="saved-posts-eyebrow">Saved</p>
          <h2>Bookmarked Places</h2>
        </div>
        <button
          className="saved-posts-close"
          type="button"
          aria-label="Close saved posts panel"
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="saved-posts-empty">
          <p>No bookmarked posts yet.</p>
        </div>
      ) : (
        <div className="saved-posts-grid">
          {posts.map((post) => (
            <button
              className="saved-post-card"
              type="button"
              key={post.id}
              onClick={() => onSelectPost(post)}
            >
              <img src={post.imageUrl ?? ""} alt={post.description || "Saved post"} />
            </button>
          ))}
        </div>
      )}
    </aside>
  );
};

export default SavedPostsPanel;
