import { describe, expect, it } from "vitest";

import { Table } from "@/contexts/events/domain/table.entity";

describe("Table Entity", () => {
  it("should have id, name and eventId properties", () => {
    const table = new Table();
    table.id = "table-1";
    table.name = "Mesa 1";
    table.eventId = "event-123";

    expect(table.id).toBe("table-1");
    expect(table.name).toBe("Mesa 1");
    expect(table.eventId).toBe("event-123");
  });
});
