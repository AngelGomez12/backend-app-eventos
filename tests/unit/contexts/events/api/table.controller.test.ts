import { beforeEach, describe, expect, it } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

import { TableController } from "@/contexts/events/api/table.controller";
import { TableService } from "@/contexts/events/domain/table.service";

describe("TableController", () => {
  let controller: TableController;
  let service: MockProxy<TableService>;

  beforeEach(() => {
    service = mock<TableService>();
    controller = new TableController(service);
  });

  describe("getTables", () => {
    it("should return paginated tables from service", async () => {
      const eventId = "event-1";
      const tenantId = "tenant-1";
      const paginationDto = { page: 1, limit: 10 };
      const paginatedResponse = {
        data: [{ id: "table-1", name: "Table A" }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      service.findAll.mockResolvedValue(paginatedResponse as any);

      const result = await controller.getTables(
        eventId,
        tenantId,
        paginationDto,
      );

      expect(service.findAll).toHaveBeenCalledWith(tenantId, eventId, 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe("addTable", () => {
    it("should create table via service", async () => {
      const eventId = "event-1";
      const tenantId = "tenant-1";
      const dto = { name: "Mesa 1" };
      service.create.mockResolvedValue({ id: "table-1", ...dto } as any);

      const result = await controller.addTable(eventId, tenantId, dto);

      expect(service.create).toHaveBeenCalledWith(tenantId, eventId, dto);
      expect(result.name).toBe("Mesa 1");
    });
  });
});
