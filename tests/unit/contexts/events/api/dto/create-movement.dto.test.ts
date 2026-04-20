import { validate } from "class-validator";
import { CreateMovementDto } from "@/contexts/events/api/dto/create-movement.dto";
import { MovementType } from "@/contexts/events/domain/movement.entity";
import { describe, expect, it } from "vitest";

describe("CreateMovementDto", () => {
  it("should validate a correct DTO", async () => {
    const dto = new CreateMovementDto();
    dto.concept = "Catering";
    dto.amount = 1000;
    dto.type = MovementType.EXPENSE;
    dto.date = new Date().toISOString();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation if amount is negative", async () => {
    const dto = new CreateMovementDto();
    dto.concept = "Refund";
    dto.amount = -100;
    dto.type = MovementType.INCOME;
    dto.date = new Date().toISOString();

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
