import express, { Router } from "express";

abstract class BaseRoute {
  protected router: Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  // Each route class that extends this must implement its own setupRoutes method
  protected abstract setupRoutes(): void;

  public getRouter(): Router {
    return this.router;
  }
}

export default BaseRoute;
