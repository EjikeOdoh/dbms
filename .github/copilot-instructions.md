# GitHub Copilot Instructions for this project

This repository is a NestJS backend for a management information system. The app is wired through [src/app.module.ts](src/app.module.ts) and uses TypeORM with PostgreSQL configured via environment variables.

## Architecture
- Follow the existing NestJS module/controller/service pattern used in [src/auth/auth.module.ts](src/auth/auth.module.ts), [src/participation/participation.module.ts](src/participation/participation.module.ts), and [src/users/users.service.ts](src/users/users.service.ts).
- Keep business logic in services, not controllers.
- Prefer DTOs for validation and Swagger documentation.
- Use repository injection via `@InjectRepository(...)` when working with entities.

## Auth and authorization
- Authentication and token generation are implemented in [src/auth/auth.service.ts](src/auth/auth.service.ts).
- Public endpoints must use the `@Public()` decorator from [src/decorators/decorators.ts](src/decorators/decorators.ts).
- Role-based access should use the existing role guard and decorator pattern from [src/decorators/roles.decorator.ts](src/decorators/roles.decorator.ts).
- Preserve the existing `JWT-auth` bearer setup in [src/main.ts](src/main.ts).

## Coding conventions
- Keep naming consistent with the current codebase.
- Use `class-validator` and `class-transformer` decorators on DTOs where appropriate.
- Prefer the existing error style:
  - `ConflictException` for duplicate records
  - `NotFoundException` when an entity is missing
  - `InternalServerErrorException` for unexpected failures
- Use simple, readable TypeScript and avoid over-engineering new abstractions.

## Domain-specific guidance
- Student data and uniqueness rules live in [src/students/entities/student.entity.ts](src/students/entities/student.entity.ts) and [src/students/dto/create-student.dto.ts](src/students/dto/create-student.dto.ts).
- Participation reporting and filtering logic is centered in [src/participation/participation.service.ts](src/participation/participation.service.ts) and [src/participation/dto/filter.dto.ts](src/participation/dto/filter.dto.ts).
- Upload/import behavior should remain aligned with [src/uploads/uploads.service.ts](src/uploads/uploads.service.ts).
- User account creation and lookups should follow the patterns in [src/users/users.service.ts](src/users/users.service.ts).
- Cloudinary-related file handling should stay consistent with [src/cloudinary/cloudinary.service.ts](src/cloudinary/cloudinary.service.ts).

## Implementation expectations
- When adding new API endpoints, follow the existing route style and Swagger decorators.
- Preserve existing request and response shapes where possible to avoid breaking clients.
- When changing entities, keep the current database uniqueness and nullable constraints in mind.
- Avoid introducing new frameworks, libraries, or patterns unless they are already established in the repository.

## Validation and quality
- Prefer small, focused changes that match the current repository style.
- Keep TypeScript types explicit where existing code expects them.
- When possible, validate changes against the existing scripts in [package.json](package.json).