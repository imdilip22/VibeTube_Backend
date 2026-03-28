import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { TABLE_NAMES } from "../constants/constant";

export class Subscription extends Model {
  declare id: string;
  declare subscriberEmail: string;
  declare channelEmail: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subscriberEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: TABLE_NAMES.USERS, key: "email" },
      onDelete: "CASCADE",
    },
    channelEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: TABLE_NAMES.USERS, key: "email" },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: TABLE_NAMES.SUBSCRIPTIONS,
    timestamps: true,
    indexes: [
      // One subscription per (subscriber, channel) pair
      { unique: true, fields: ["subscriberEmail", "channelEmail"] },
    ],
  }
);
