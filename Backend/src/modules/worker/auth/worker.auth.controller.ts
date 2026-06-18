import { NextFunction, Request, Response } from "express";
import WorkerAuthService from "./worker.auth.service";
import { WorkerLoginInput, WorkerLoginResponse } from "../worker.schema";

export default class WorkerAuthController {
  private workerAuthService: WorkerAuthService;

  constructor(workerAuthService: WorkerAuthService) {
    this.workerAuthService = workerAuthService;
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: WorkerLoginInput = req.body;
      const loginResponse: WorkerLoginResponse =
        await this.workerAuthService.login(data);

      res.status(201).json(loginResponse);
    } catch (error) {
      next(error);
    }
  }
}
