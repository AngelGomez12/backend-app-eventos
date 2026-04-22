import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { User } from "@/contexts/users/domain/user.entity";
import { UserService } from "@/contexts/users/domain/user.service";

describe("UserService", () => {
  let service: UserService;
  let repository: DeepMockProxy<Repository<User>>;

  beforeEach(async () => {
    repository = mockDeep<Repository<User>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe("findAll", () => {
    it("should return paginated users for a tenant", async () => {
      const tenantId = "tenant-1";
      const page = 1;
      const limit = 10;
      repository.findAndCount.mockResolvedValue([
        [{ id: "user-1", fullName: "John Doe" } as User],
        1,
      ]);

      const result = await service.findAll(tenantId, page, limit);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { tenantId },
        order: { fullName: "ASC" },
        skip: 0,
        take: 10,
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
