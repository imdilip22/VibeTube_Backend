import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { TABLE_NAMES } from "../constants/constant";

export class Comment extends Model {
  declare id: string;
  declare videoId: string;
  declare userEmail: string;
  declare content: string;
  declare parentId: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Comment.init(
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
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: TABLE_NAMES.COMMENTS, key: "id" },
      onDelete: "CASCADE",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: TABLE_NAMES.COMMENTS,
    timestamps: true,
  }
);
