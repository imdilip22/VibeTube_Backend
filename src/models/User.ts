import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { TABLE_NAMES } from "../constants/constant";

export class User extends Model {
  declare email: string;
  declare name: string;
  declare password: string | null;
  declare googleId: string | null;
  declare avatar: string | null;      // filename stored in uploads/profiles/
  declare coverPhoto: string | null;  // filename stored in uploads/covers/
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "User",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,   // nullable — Google users have no password
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coverPhoto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: TABLE_NAMES.USERS,
    timestamps: true,
  }
);