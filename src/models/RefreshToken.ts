import { DataTypes, Model } from "sequelize";
import { TABLE_NAMES } from "../constants/constant";
import sequelize from "../config/database";

export class RefreshToken extends Model {
  declare id: string;
  declare userEmail: string;
  declare token: string;
  declare expiresAt: Date;
  declare revoked: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: TABLE_NAMES.USERS,
        key: "email", // ✅ FIXED
      },
      onDelete: "CASCADE",
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: TABLE_NAMES.REFRESH_TOKENS,
    timestamps: true,
  }
);