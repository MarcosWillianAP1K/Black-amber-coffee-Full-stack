export type HealthStatus = {
  status: "ok";
  timestamp: string;
  uptime: number;
  environment: string;
};

export function getHealthStatus(): HealthStatus {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? "development",
  };
}
