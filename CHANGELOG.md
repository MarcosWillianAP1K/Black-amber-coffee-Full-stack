# CHANGELOG

All notable changes to this project will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.1.0] - 2026-06-26

### Addedd

- Security middleware with 5 ASVS rules (HTTP headers, rate limiting, input size limit, auth logging, sensitive data masking)
- Metrics endpoint `/v1/api/metrics` exposing 10 system/application metrics
- Unit tests for `authService` (register, login, refreshToken, logout, resetPassword flows)
- `CHANGELOG.md` tracking all releases

### Changed

- `server.ts`: registered global security middleware before routes
- `health.routes.ts`: added `/metrics` route

### Fixed

- Cross-testing bugs reported by external group (see Issues)

---

## [1.0.0] - 2026-06-10

### Added

- Full-stack project: Backend (Node/Express/TypeScript) + Frontend (React/Vite)
- Authentication module: register, login, refresh token, logout, password reset
- Products, Orders, Cart, Payment, Inventory, Workers, Analytics modules
- Swagger docs at `/v1/docs`
- Docker Compose setup for local development
- Database migrations with Drizzle ORM (PostgreSQL)
- Email service (Resend) for password reset
- AWS S3 integration for image uploads
- Pino logger for structured logging
