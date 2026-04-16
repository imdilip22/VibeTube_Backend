import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { TABLE_NAMES } from "../constants/constant";

export class Stream extends Model {
  declare id: string;
  declare streamKey: string;
  declare title: string;
  declare creatorEmail: string;
  declare isLive: boolean;
  declare viewerCount: number;
  declare thumbnailPath: string | null;
  declare archivedVideoId: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Stream.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    streamKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creatorEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: TABLE_NAMES.USERS,
        key: "email",
      },
      onDelete: "CASCADE",
    },
    isLive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    viewerCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    thumbnailPath: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    // Pre-created Video record ID — allows social features (likes/comments/watch-later)
    // to work during the live stream and seamlessly carry over to the archive.
    archivedVideoId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: TABLE_NAMES.STREAMS,
    timestamps: true,
  }
);
