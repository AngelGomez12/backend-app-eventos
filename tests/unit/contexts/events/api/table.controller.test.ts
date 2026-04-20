import { TableController } from "@/contexts/events/api/table.controller";
import { TableService } from "@/contexts/events/domain/table.service";
import { describe, expect, it, beforeEach } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

describe("TableController", () => {
  let controller: TableController;
  let service: MockProxy<TableService>;

  beforeEach(() => {
    service = mock<TableService>();
    controller = new TableController(service);
  });

  describe("getTables", () => {
    it("should return tables from service", async () => {
      const eventId = "event-1";
      const tenantId = "tenant-1";
      service.findAll.mockResolvedValue([{ id: "table-1", name: "Mesa 1" }] as any);

      const result = await controller.getTables(eventId, tenantId);

      expect(service.findAll).toHaveBeenCalledWith(tenantId, eventId);
      expect(result).toHaveLength(1);
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
