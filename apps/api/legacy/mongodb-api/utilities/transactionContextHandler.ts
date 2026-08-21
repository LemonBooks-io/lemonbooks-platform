import mongoose, { ClientSession } from "mongoose";

/**
 * UnitOfWork class to manage database transactions using Mongoose.
 * It provides methods to begin, commit, and rollback transactions.
 */
export default class TransactionContextHandler {
  private session: ClientSession | null = null;

  async begin(): Promise<void> {
    this.session = await mongoose.startSession();
    this.session.startTransaction();
  }

  async commit(): Promise<void> {
    if (!this.session) throw new Error("No active transaction.");
    try {
      await this.session.commitTransaction();
    } finally {
      this.session.endSession();
      this.session = null;
    }
  }

  async rollback(): Promise<void> {
    if (!this.session) throw new Error("No active transaction.");
    try {
      await this.session.abortTransaction();
    } finally {
      this.session.endSession();
      this.session = null;
    }
  }

  getSession(): ClientSession {
    if (!this.session) throw new Error("Transaction not started. Call begin() first.");
    return this.session;
  }
}
