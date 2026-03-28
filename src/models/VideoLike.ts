import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { TABLE_NAMES } from "../constants/constant";

export class VideoLike extends Model {
  declare id: string;
  declare videoId: string;
  declare userEmail: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

VideoLike.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    videoId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: TABLE_NAMES.VIDEOS, key: "id" },
      onDelete: "CASCADE",
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: TABLE_NAMES.USERS, key: "email" },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: TABLE_NAMES.VIDEO_LIKES,
    timestamps: true,
    indexes: [{ unique: true, fields: ["videoId", "userEmail"] }],
  }
);
