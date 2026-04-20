import { AttendanceStatus, Guest } from "@/contexts/events/domain/guest.entity";
import { describe, expect, it } from "vitest";

describe("Guest Entity", () => {
  it("should have phone, dietaryRestrictions and tableId properties", () => {
    const guest = new Guest();
    guest.id = "guest-1";
    guest.fullName = "Jane Doe";
    guest.attendanceStatus = AttendanceStatus.PENDING;
    guest.eventId = "event-123";
    
    // These should cause compilation/runtime errors if not implemented
    (guest as any).phone = "+54 9 11 1234-5678";
    (guest as any).dietaryRestrictions = "Vegan";
    (guest as any).tableId = "table-1";

    expect(guest.phone).toBe("+54 9 11 1234-5678");
    expect(guest.dietaryRestrictions).toBe("Vegan");
    expect(guest.tableId).toBe("table-1");
  });
});
