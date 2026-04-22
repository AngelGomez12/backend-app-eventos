import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { GlobalNotification } from "@/contexts/notifications/domain/notification.entity";
import { NotificationService } from "@/contexts/notifications/domain/notification.service";

describe("NotificationService", () => {
  let service: NotificationService;
  let repository: DeepMockProxy<Repository<GlobalNotification>>;

  beforeEach(async () => {
    repository = mockDeep<Repository<GlobalNotification>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(GlobalNotification),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  describe("findAll", () => {
    it("should return paginated notifications", async () => {
      const page = 1;
      const limit = 10;
      const notifications = [{ id: "notif-1" } as GlobalNotification];
      const total = 1;

      const queryBuilder = {
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([notifications, total]),
      };
      (repository.createQueryBuilder as any).mockReturnValue(queryBuilder);

      const result = await service.findAll({ page, limit });

      expect(repository.createQueryBuilder).toHaveBeenCalledWith("notification");
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        "notification.createdAt",
        "DESC",
      );
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
