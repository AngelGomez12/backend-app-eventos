import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { CreateUserDto } from "@/contexts/users/api/dto/create-user.dto";
import { UserRole } from "@/contexts/users/domain/user.entity";

describe("CreateUserDto", () => {
  it("should validate a correct DTO", async () => {
    const dto = new CreateUserDto();
    dto.fullName = "John Doe";
    dto.email = "john@example.com";
    dto.password = "securePassword123";
    dto.role = UserRole.ORGANIZER;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail when email is invalid", async () => {
    const dto = new CreateUserDto();
    dto.fullName = "John Doe";
    dto.email = "not-an-email"; // <--- Email inválido
    dto.password = "securePassword123";
    dto.role = UserRole.ORGANIZER;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("email");
  });

  it("should fail when password is too short", async () => {
    const dto = new CreateUserDto();
    dto.fullName = "John Doe";
    dto.email = "john@example.com";
    dto.password = "123"; // <--- Password muy corta (min 6)
    dto.role = UserRole.ORGANIZER;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("password");
  });

  it("should fail when role is invalid", async () => {
    const dto = new CreateUserDto();
    dto.fullName = "John Doe";
    dto.email = "john@example.com";
    dto.password = "securePassword123";
    dto.role = "INVALID_ROLE" as UserRole; // <--- Role inválido

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("role");
  });

  it("should fail when fullName is empty", async () => {
    const dto = new CreateUserDto();
    dto.fullName = ""; // <--- Nombre vacío
    dto.email = "john@example.com";
    dto.password = "securePassword123";
    dto.role = UserRole.ORGANIZER;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe("fullName");
  });
});
