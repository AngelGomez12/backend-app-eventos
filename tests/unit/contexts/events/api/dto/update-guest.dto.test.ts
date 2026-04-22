import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { UpdateGuestDto } from "@/contexts/events/api/dto/update-guest.dto";
import { AttendanceStatus } from "@/contexts/events/domain/guest.entity";

describe("UpdateGuestDto", () => {
  it("should validate a correct DTO", async () => {
    const dto = new UpdateGuestDto();
    dto.fullName = "Jane Doe";
    dto.attendanceStatus = AttendanceStatus.CONFIRMED;
    dto.phone = "+54...";
    dto.dietaryRestrictions = "Vegan";
    dto.tableId = "550e8400-e29b-41d4-a716-446655440000";

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should validate an empty DTO (all optional)", async () => {
    const dto = new UpdateGuestDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
