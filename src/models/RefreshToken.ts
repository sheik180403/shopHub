import mongoose, { Schema, model, models } from "mongoose";

export interface IRefreshToken {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  token: string;
  ipHash?: string;
  deviceInfo?: string;
  expiresAt: Date;
  revoked: boolean;
  replacedBySessionId?: string | null;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  isExpired(): boolean;
  isActive(): boolean;
  revoke(replacedBySessionId?: string | null): Promise<void>;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
      index: true,
    },

    ipHash: {
      type: String,
    },

    deviceInfo: {
      type: String,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    revoked: {
      type: Boolean,
      default: false,
    },

    replacedBySessionId: {
      type: String,
      default: null,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Auto-delete expired refresh tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/* ================= METHODS ================= */

refreshTokenSchema.methods.isExpired = function (): boolean {
  return Date.now() >= this.expiresAt.getTime();
};

refreshTokenSchema.methods.isActive = function (): boolean {
  return !this.revoked && !this.isExpired();
};

refreshTokenSchema.methods.revoke = async function (
  replacedBySessionId: string | null = null,
): Promise<void> {
  this.revoked = true;

  if (replacedBySessionId) {
    this.replacedBySessionId = replacedBySessionId;
  }

  await this.save();
};

const RefreshToken =
  models.RefreshToken ||
  model<IRefreshToken>("RefreshToken", refreshTokenSchema);

export default RefreshToken;
