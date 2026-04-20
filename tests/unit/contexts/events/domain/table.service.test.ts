import { TableService } from "@/contexts/events/domain/table.service";
import { EventService } from "@/contexts/events/domain/event.service";
import { Table } from "@/contexts/events/domain/table.entity";
import { CreateTableDto } from "@/contexts/events/api/dto/create-table.dto";
import { describe, expect, it, beforeEach } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";
import { Repository } from "typeorm";

describe("TableService", () => {
  let service: TableService;
  let tableRepository: MockProxy<Repository<Table>>;
  let eventService: MockProxy<EventService>;

  beforeEach(() => {
    tableRepository = mock<Repository<Table>>();
    eventService = mock<EventService>();
    service = new TableService(tableRepository, eventService);
  });

  describe("create", () => {
    it("should create a table if event belongs to tenant", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const dto: CreateTableDto = { name: "Mesa 1" };
      
      eventService.findOne.mockResolvedValue({ id: eventId } as any);
      tableRepository.create.mockReturnValue({ ...dto, eventId } as any);
      tableRepository.save.mockResolvedValue({ id: "table-1", ...dto, eventId } as any);

      const result = await service.create(tenantId, eventId, dto);

      expect(eventService.findOne).toHaveBeenCalledWith(eventId, tenantId);
      expect(tableRepository.save).toHaveBeenCalled();
      expect(result.name).toBe("Mesa 1");
    });
  });

  describe("findAll", () => {
    it("should return all tables for an event", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      
      eventService.findOne.mockResolvedValue({ id: eventId } as any);
      tableRepository.find.mockResolvedValue([{ id: "table-1", name: "Mesa 1" }] as any);

      const result = await service.findAll(tenantId, eventId);

      expect(eventService.findOne).toHaveBeenCalledWith(eventId, tenantId);
      expect(result).toHaveLength(1);
    });
  });
});
