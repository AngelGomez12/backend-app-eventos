import { beforeEach, describe, expect, it } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

import { MovementController } from "@/contexts/events/api/movement.controller";
import { MovementType } from "@/contexts/events/domain/movement.entity";
import { MovementService } from "@/contexts/events/domain/movement.service";

describe("MovementController", () => {
  let controller: MovementController;
  let service: MockProxy<MovementService>;

  beforeEach(() => {
    service = mock<MovementService>();
    controller = new MovementController(service);
  });

  describe("getMovements", () => {
    it("should return paginated movements from service", async () => {
      const eventId = "event-1";
      const tenantId = "tenant-1";
      const paginationDto = { page: 1, limit: 10 };
      const paginatedResponse = {
        data: [{ id: "move-1", concept: "A" }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      service.findAll.mockResolvedValue(paginatedResponse as any);

      const result = await controller.getMovements(
        eventId,
        tenantId,
        paginationDto,
      );

      expect(service.findAll).toHaveBeenCalledWith(tenantId, eventId, 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it("should return paginated movements from service with custom parameters", async () => {
      const eventId = "event-1";
      const tenantId = "tenant-1";
      const paginationDto = { page: 2, limit: 5 };
      const paginatedResponse = {
        data: [{ id: "move-2", concept: "B" }],
        meta: { total: 10, page: 2, limit: 5, totalPages: 2 },
      };
      service.findAll.mockResolvedValue(paginatedResponse as any);

      const result = await controller.getMovements(
        eventId,
        tenantId,
        paginationDto,
      );

      expect(service.findAll).toHaveBeenCalledWith(tenantId, eventId, 2, 5);
      expect(result.meta.totalPages).toBe(2);
    });
  });

  describe("addMovement", () => {
    it("should create movement via service", async () => {
      const eventId = "event-1";
      const tenantId = "tenant-1";
      const dto = {
        concept: "Deposit",
        amount: 1000,
        type: MovementType.INCOME,
        date: "2026-04-15",
      };
      service.create.mockResolvedValue({ id: "move-1", ...dto } as any);

      const result = await controller.addMovement(eventId, tenantId, dto);

      expect(service.create).toHaveBeenCalledWith(tenantId, eventId, dto);
      expect(result.concept).toBe("Deposit");
    });
  });
});
