# Copilot Instructions for Edartee Backend API v2

## Project Structure

- **config/**: Environment-specific configuration files (`development.ts`, `production.ts`).
- **src/**: Main backend source code.
  - **api/**: Express route handlers, controllers, and services.
    - **controllers/**: Request/response logic.
    - **routes/**: Route definitions, use middlewares and controllers.
    - **services/**: Business logic, interact with repositories.
  - **database/**: Mongoose models and seeders.
  - **dtos/**: Data Transfer Objects for API responses.
  - **docs/**: OpenAPI/Swagger documentation.
  - **email/**: Email templates and logic.
  - **enums/**: Enum definitions.
  - **helpers/**: Utility/helper functions (e.g., CSV parsing).
  - **http/**: HTTP utilities.
  - **interfaces/**: TypeScript interfaces for models, repositories, and DTOs.
  - **middlewares/**: Express middlewares (authentication, validation, etc.).
  - **repositories/**: Data access layer, generic and specific repositories.
  - **storage/**: File storage logic.
  - **utilities/**: Miscellaneous utilities (e.g., error handling, base classes).
- **frontend-demo/**: Frontend demo app (not part of backend logic).

## Coding Conventions

- **TypeScript** is used throughout the backend.
- **Repository Pattern**: All database access goes through repositories in `src/repositories/`.
- **DTOs**: Use DTOs from `src/dtos/` for shaping API responses.
- **Controllers**: Only handle HTTP logic, delegate business logic to services.
- **Services**: Contain business logic, interact with repositories and helpers.
- **Middlewares**: Used for authentication, validation, tenancy, etc.
- **Swagger/OpenAPI**: API documentation is in `src/docs/api-docs/`.
- **Bulk Operations**: Use CSV upload helpers in `src/helpers/csv.parser.ts` and bulkCreate methods in repositories.
- **Error Handling**: Use `ApiError` from `src/utilities/error.base.ts`.

## Where to Add New Code

- **New API endpoints**:  
  - Add route in `src/api/routes/`.
  - Add controller method in `src/api/controllers/`.
  - Add service method in `src/api/services/`.
  - Add repository method if new DB logic is needed.
- **New Models**:  
  - Add Mongoose model in `src/database/models/`.
  - Add interface in `src/interfaces/`.
  - Add repository in `src/repositories/`.
- **New DTOs**:  
  - Add in `src/dtos/`.
- **New Enums**:  
  - Add in `src/enums/`.
- **New Helpers/Utilities**:  
  - Add in `src/helpers/` or `src/utilities/`.

## Patterns & Examples

- **Repository Usage**:  
  - Always use repositories for DB access, never use Mongoose models directly in services or controllers.
  - Example:  
    ```ts
    const userRepository = new UserRepository();
    const user = await userRepository.findById(userId);
    ```

- **Bulk CSV Upload**:  
  - Use `CsvUploadHelper.csvParserHelper` for parsing.
  - Use `bulkCreate` on the repository for insertion.
  - Example:  
    ```ts
    const data = await CsvUploadHelper.csvParserHelper(file, expectedHeaders);
    await repository.bulkCreate(data);
    ```

- **DTO Usage**:  
  - Always wrap API responses in DTOs.
  - Example:  
    ```ts
    return new UserDTO(user);
    ```

- **Error Handling**:  
  - Throw `ApiError` for business logic errors.
  - Example:  
    ```ts
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    ```

- **Swagger Docs**:  
  - Add or update OpenAPI docs in `src/docs/api-docs/`.

## Naming Conventions

- **Classes**: PascalCase (e.g., `UserService`, `UserController`)
- **Files**: kebab-case or camelCase (e.g., `user.service.ts`, `userController.ts`)
- **Interfaces**: Prefix with `I` (e.g., `IUser`, `IUserRepository`)
- **DTOs**: Suffix with `DTO` (e.g., `UserDTO`)
- **Repository Classes**: Suffix with `Repository` (e.g., `UserRepository`)

## Middleware Usage

- **Authentication**: Use `AuthenticationMiddleware.AuthenticateUser()` for protected routes.
- **Validation**: Use `RequestValidator.validateRequestSchema(schema)` for request validation.
- **Tenancy**: Use `TenancyMiddleware.GetTenant` for tenant-aware routes.

---

**Always follow these conventions and structure when generating or suggesting code for this project.**