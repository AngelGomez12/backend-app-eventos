import { describe, expect, it, beforeEach } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";
import { MovementController } from "@/contexts/events/api/movement.controller";
import { MovementService } from "@/contexts/events/domain/movement.service";
import { MovementType } from "@/contexts/events/domain/movement.entity";

describe("MovementController", () => {
  let controller: MovementController;
  let service: MockProxy<MovementService>;

  beforeEach(() => {
    service = mock<MovementService>();
    controller = new MovementController(service);
  });

  describe("getMovements", () => {
    it("should return movements from service", async () => {
      const eventId = "event-1";
      const tenantId = "tenant-1";
      service.findAll.mockResolvedValue([{ id: "move-1", concept: "A" }] as any);

      const result = await controller.getMovements(eventId, tenantId);

      expect(service.findAll).toHaveBeenCalledWith(tenantId, eventId);
      expect(result).toHaveLength(1);
    });
  });

  describe("addMovement", () => {
    it("should create movement via service", async () => {
      const eventId = "event-1";
      const tenantId = "tenant-1";
      const dto = { concept: "Deposit", amount: 1000, type: MovementType.INCOME, date: "2026-04-15" };
      service.create.mockResolvedValue({ id: "move-1", ...dto } as any);

      const result = await controller.addMovement(eventId, tenantId, dto);

      expect(service.create).toHaveBeenCalledWith(tenantId, eventId, dto);
      expect(result.concept).toBe("Deposit");
    });
  });
});
