import { Request, Response } from "express";
import { getHealthStatus } from "./health.service";

export function healthController(_req: Request, res: Response): void {
  res.status(200).json(getHealthStatus());
}
