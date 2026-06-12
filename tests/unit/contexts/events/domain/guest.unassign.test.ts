import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { UpdateGuestDto } from "@/contexts/events/api/dto/update-guest.dto";
import { EventService } from "@/contexts/events/domain/event.service";
import { TableService } from "@/contexts/events/domain/table.service";
import { Guest } from "@/contexts/events/domain/guest.entity";
import { GuestService } from "@/contexts/events/domain/guest.service";
import { NotificationService } from "@/contexts/shared/infrastructure/notifications/notification.service";

describe("GuestService (Unassign Validation)", () => {
  let service: GuestService;
  let guestRepository: DeepMockProxy<Repository<Guest>>;
  let eventService: DeepMockProxy<EventService>;
  let tableService: DeepMockProxy<TableService>;
  let notificationService: DeepMockProxy<NotificationService>;

  beforeEach(async () => {
    guestRepository = mockDeep<Repository<Guest>>();
    eventService = mockDeep<EventService>();
    tableService = mockDeep<TableService>();
    notificationService = mockDeep<NotificationService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuestService,
        {
          provide: getRepositoryToken(Guest),
          useValue: guestRepository,
        },
        {
          provide: EventService,
          useValue: eventService,
        },
        {
          provide: TableService,
          useValue: tableService,
        },
        {
          provide: NotificationService,
          useValue: notificationService,
        },
      ],
    }).compile();

    service = module.get<GuestService>(GuestService);
  });

  describe("update", () => {
    it("should allow unassigning a guest (tableId: null)", async () => {
      const tenantId = "tenant-1";
      const eventId = "event-1";
      const guestId = "guest-1";
      const dto: UpdateGuestDto = { tableId: null };

      eventService.findOne.mockResolvedValue({ id: eventId } as any);
      guestRepository.findOne.mockResolvedValue({
        id: guestId,
        eventId,
        tableId: "some-table-id",
      } as any);
      
      guestRepository.save.mockImplementation(async (g: any) => g as any);

      const result = await service.update(tenantId, eventId, guestId, dto);

      expect(result.tableId).toBe(null);
      expect(tableService.findOne).not.toHaveBeenCalled();
    });
  });
});
