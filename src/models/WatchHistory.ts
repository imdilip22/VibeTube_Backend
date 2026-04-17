import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { TABLE_NAMES } from "../constants/constant";

export class WatchHistory extends Model {
  declare id: string;
  declare userEmail: string;
  declare videoId: string;
  declare watchedAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

WatchHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: TABLE_NAMES.USERS, key: "email" },
      onDelete: "CASCADE",
    },
    videoId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: TABLE_NAMES.VIDEOS, key: "id" },
      onDelete: "CASCADE",
    },
    watchedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: TABLE_NAMES.WATCH_HISTORY,
    timestamps: true,
    indexes: [{ unique: true, fields: ["userEmail", "videoId"] }],
  }
);
