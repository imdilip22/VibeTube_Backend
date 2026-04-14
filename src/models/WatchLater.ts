import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { TABLE_NAMES } from "../constants/constant";

export class WatchLater extends Model {
  declare id: string;
  declare userEmail: string;
  declare videoId: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

WatchLater.init(
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
  },
  {
    sequelize,
    tableName: TABLE_NAMES.WATCH_LATER,
    timestamps: true,
    indexes: [{ unique: true, fields: ["userEmail", "videoId"] }],
  }
);
