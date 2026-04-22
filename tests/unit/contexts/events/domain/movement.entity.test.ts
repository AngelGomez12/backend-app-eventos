import { describe, expect, it } from "vitest";

import {
  EventMovement,
  MovementType,
} from "@/contexts/events/domain/movement.entity";

describe("EventMovement Entity", () => {
  it("should have all required properties", () => {
    const movement = new EventMovement();
    movement.id = "move-1";
    movement.concept = "Catering Deposit";
    movement.amount = 1500.5;
    movement.type = MovementType.EXPENSE;
    movement.date = new Date("2026-04-15");
    movement.eventId = "event-123";

    expect(movement.id).toBe("move-1");
    expect(movement.concept).toBe("Catering Deposit");
    expect(movement.amount).toBe(1500.5);
    expect(movement.type).toBe(MovementType.EXPENSE);
    expect(movement.eventId).toBe("event-123");
  });
});
