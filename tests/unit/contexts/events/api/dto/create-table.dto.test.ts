import { CreateTableDto } from "@/contexts/events/api/dto/create-table.dto";
import { describe, expect, it } from "vitest";
import { validate } from "class-validator";

describe("CreateTableDto", () => {
  it("should validate a correct DTO", async () => {
    const dto = new CreateTableDto();
    dto.name = "Mesa 1";

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation if name is empty", async () => {
    const dto = new CreateTableDto();
    dto.name = "";

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
