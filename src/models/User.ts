import mongoose, { Schema, Document, Model } from "mongoose";
import connectToDatabase from "@/lib/db";

export interface IEmailAddress {
  id?: string;
  emailAddress: string;
  verification?: unknown;
}

export interface IExternalAccount {
  id?: string;
  provider?: string;
  provider_user_id?: string;
  email_address?: string;
}

export interface IUser extends Document {
  clerkId?: string;
  username?: string;
  email?: string;
  emailAddresses?: IEmailAddress[];
  primaryEmailAddressId?: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  imageUrl?: string | null;
  hasImage?: boolean;
  passwordEnabled?: boolean;
  publicMetadata?: Record<string, unknown>;
  privateMetadata?: Record<string, unknown>;
  unsafeMetadata?: Record<string, unknown>;
  externalAccounts?: IExternalAccount[];
  inactive?: boolean;
  seedPassword?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    clerkId: { type: String, index: true, unique: true, sparse: true },
    username: { type: String, index: true, unique: true, sparse: true },
    email: { type: String, required: true, index: true, unique: true },
    emailAddresses: { type: Array, default: [] },
    primaryEmailAddressId: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String },
    imageUrl: { type: String },
    hasImage: { type: Boolean },
    passwordEnabled: { type: Boolean },
    publicMetadata: { type: Schema.Types.Mixed, default: {} },
    privateMetadata: { type: Schema.Types.Mixed, default: {} },
    unsafeMetadata: { type: Schema.Types.Mixed, default: {} },
    externalAccounts: { type: Array, default: [] },
    inactive: { type: Boolean, default: false },
    seedPassword: { type: String },
  },
  {
    timestamps: true,
  }
);

// Ensure model is not recompiled in dev hot reload
const modelName = "User";

let User: Model<IUser>;
try {
  User = mongoose.model<IUser>(modelName);
} catch (_) {
  User = mongoose.model<IUser>(modelName, UserSchema);
}

export async function getUserModel() {
  await connectToDatabase();
  return User;
}

export default User;
