import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { TABLE_NAMES } from "../constants/constant";

export class Video extends Model {
  declare id: string;
  declare title: string;
  declare originalName: string;
  declare status: "processing" | "done" | "error";
  declare createdBy: string;
  declare thumbnailPath: string | null;
  declare error: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Video.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("processing", "done", "error"),
      allowNull: false,
      defaultValue: "processing",
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: TABLE_NAMES.USERS,
        key: "email",
      },
      onDelete: "CASCADE",
    },
    thumbnailPath: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: TABLE_NAMES.VIDEOS,
    timestamps: true,
  }
);
