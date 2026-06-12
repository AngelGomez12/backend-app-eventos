import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { AttendanceStatus, Guest } from "@/contexts/events/domain/guest.entity";
import { NotificationService } from "@/contexts/shared/infrastructure/notifications/notification.service";

import { ConfirmRsvpDto } from "../api/dto/confirm-rsvp.dto";

@Injectable()
export class RsvpService {
  private readonly logger = new Logger(RsvpService.name);

  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
    private readonly notificationService: NotificationService,
  ) {}

  async getInvitation(token: string) {
    try {
      const guest = await this.guestRepository.findOne({
        where: { id: token },
        relations: ["event"],
      });

      if (!guest) {
        throw new NotFoundException("Token not found or invitation expired.");
      }

      return {
        message: `Invitation data for token: ${token}`,
        guestName: guest.fullName,
        // eventImage: guest.event.image // TODO: Uncomment when event images are implemented
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException("Invalid token format.");
    }
  }

  async confirmRsvp(token: string, confirmDto: ConfirmRsvpDto) {
    try {
      const guest = await this.guestRepository.findOne({
        where: { id: token },
      });

      if (!guest) {
        throw new NotFoundException("Token not found or invitation expired.");
      }

      guest.attendanceStatus = confirmDto.attendanceStatus;
      await this.guestRepository.save(guest);

      // Trigger notification if confirmed and has email
      if (
        guest.attendanceStatus === AttendanceStatus.CONFIRMED &&
        guest.email
      ) {
        this.guestRepository
          .findOne({
            where: { id: token },
            relations: ["event", "event.tenant"],
          })
          .then((extendedGuest) => {
            if (
              extendedGuest &&
              extendedGuest.event &&
              extendedGuest.event.tenant
            ) {
              this.notificationService
                .sendGuestTicket(
                  extendedGuest,
                  extendedGuest.event,
                  extendedGuest.event.tenant,
                )
                .catch((err) => {
                  this.logger.error(
                    `Failed to send guest ticket email for guest ${extendedGuest.id}: ${err.message}`,
                    err.stack,
                  );
                });
            }
          })
          .catch((err) => {
            this.logger.error(
              `Failed to fetch extended guest info for notification ${token}: ${err.message}`,
              err.stack,
            );
          });
      }

      return {
        message: `RSVP updated for token: ${token}`,
        newStatus: guest.attendanceStatus,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException("Invalid token format.");
    }
  }
}
