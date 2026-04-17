import { User } from "./User";
import { RefreshToken } from "./RefreshToken";
import { Video } from "./Video";
import { Subscription } from "./Subscription";
import { VideoLike } from "./VideoLike";
import { Comment } from "./Comment";
import { WatchLater } from "./WatchLater";
import { WatchHistory } from "./WatchHistory";
import { Stream } from "./Stream";

// ─── User ↔ RefreshToken ──────────────────────────────────────────────────────
User.hasMany(RefreshToken, {
  foreignKey: "userEmail",
  sourceKey: "email",
  as: "refreshTokens",
  onDelete: "CASCADE",
});

RefreshToken.belongsTo(User, {
  foreignKey: "userEmail",
  targetKey: "email",
  as: "user",
});

// ─── User ↔ Video ─────────────────────────────────────────────────────────────
User.hasMany(Video, {
  foreignKey: "createdBy",
  sourceKey: "email",
  as: "videos",
  onDelete: "CASCADE",
});

Video.belongsTo(User, {
  foreignKey: "createdBy",
  targetKey: "email",
  as: "uploader",
});

// ─── Subscription associations ────────────────────────────────────────────────
User.hasMany(Subscription, {
  foreignKey: "subscriberEmail",
  sourceKey: "email",
  as: "subscriptions",
  onDelete: "CASCADE",
});

User.hasMany(Subscription, {
  foreignKey: "channelEmail",
  sourceKey: "email",
  as: "subscribers",
  onDelete: "CASCADE",
});

Subscription.belongsTo(User, { foreignKey: "subscriberEmail", targetKey: "email", as: "subscriber" });
Subscription.belongsTo(User, { foreignKey: "channelEmail", targetKey: "email", as: "channel" });

// ─── VideoLike associations ───────────────────────────────────────────────────
Video.hasMany(VideoLike, { foreignKey: "videoId", as: "likes", onDelete: "CASCADE" });
VideoLike.belongsTo(Video, { foreignKey: "videoId", as: "video" });

User.hasMany(VideoLike, {
  foreignKey: "userEmail",
  sourceKey: "email",
  as: "videoLikes",
  onDelete: "CASCADE",
});
VideoLike.belongsTo(User, { foreignKey: "userEmail", targetKey: "email", as: "liker" });

// ─── Comment associations ─────────────────────────────────────────────────────
Video.hasMany(Comment, { foreignKey: "videoId", as: "comments", onDelete: "CASCADE" });
Comment.belongsTo(Video, { foreignKey: "videoId", as: "video" });

User.hasMany(Comment, {
  foreignKey: "userEmail",
  sourceKey: "email",
  as: "comments",
  onDelete: "CASCADE",
});
Comment.belongsTo(User, { foreignKey: "userEmail", targetKey: "email", as: "commenter" });
Comment.hasMany(Comment, { foreignKey: "parentId", as: "replies", onDelete: "CASCADE" });
Comment.belongsTo(Comment, { foreignKey: "parentId", as: "parent" });

// ─── WatchLater associations ──────────────────────────────────────────────────
User.hasMany(WatchLater, {
  foreignKey: "userEmail",
  sourceKey: "email",
  as: "watchLater",
  onDelete: "CASCADE",
});
WatchLater.belongsTo(User, { foreignKey: "userEmail", targetKey: "email", as: "user" });

Video.hasMany(WatchLater, { foreignKey: "videoId", as: "watchLaterEntries", onDelete: "CASCADE" });
WatchLater.belongsTo(Video, { foreignKey: "videoId", as: "video" });

// ─── WatchHistory associations ────────────────────────────────────────────────
User.hasMany(WatchHistory, {
  foreignKey: "userEmail",
  sourceKey: "email",
  as: "watchHistory",
  onDelete: "CASCADE",
});
WatchHistory.belongsTo(User, { foreignKey: "userEmail", targetKey: "email", as: "user" });

Video.hasMany(WatchHistory, { foreignKey: "videoId", as: "watchHistoryEntries", onDelete: "CASCADE" });
WatchHistory.belongsTo(Video, { foreignKey: "videoId", as: "video" });

// ─── Stream associations ──────────────────────────────────────────────────────
User.hasMany(Stream, {
  foreignKey: "creatorEmail",
  sourceKey: "email",
  as: "streams",
  onDelete: "CASCADE",
});
Stream.belongsTo(User, {
  foreignKey: "creatorEmail",
  targetKey: "email",
  as: "creator",
});

export { User, RefreshToken, Video, Subscription, VideoLike, Comment, WatchLater, WatchHistory, Stream };
