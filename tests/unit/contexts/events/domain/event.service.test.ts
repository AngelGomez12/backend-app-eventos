import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { Event } from "@/contexts/events/domain/event.entity";
import { EventService } from "@/contexts/events/domain/event.service";
import { EventPayment } from "@/contexts/events/domain/event-payment.entity";
import { UserRole } from "@/contexts/users/domain/user.entity";

describe("EventService", () => {
  let service: EventService;
  let eventRepository: DeepMockProxy<Repository<Event>>;
  let paymentRepository: DeepMockProxy<Repository<EventPayment>>;

  beforeEach(async () => {
    eventRepository = mockDeep<Repository<Event>>();
    paymentRepository = mockDeep<Repository<EventPayment>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getRepositoryToken(Event),
          useValue: eventRepository,
        },
        {
          provide: getRepositoryToken(EventPayment),
          useValue: paymentRepository,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  describe("findAll", () => {
    it("should return paginated events", async () => {
      const tenantId = "tenant-1";
      const user = { id: "user-1", role: UserRole.SALON_ADMIN };
      const page = 1;
      const limit = 10;

      const mockQueryBuilder = mockDeep<SelectQueryBuilder<Event>>();
      eventRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.where.mockReturnThis();
      mockQueryBuilder.leftJoinAndSelect.mockReturnThis();
      mockQueryBuilder.andWhere.mockReturnThis();
      mockQueryBuilder.orderBy.mockReturnThis();
      mockQueryBuilder.skip.mockReturnThis();
      mockQueryBuilder.take.mockReturnThis();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        [{ id: "event-1" } as Event],
        1,
      ]);

      const result = await service.findAll(tenantId, user, page, limit);

      expect(eventRepository.createQueryBuilder).toHaveBeenCalledWith("event");
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
