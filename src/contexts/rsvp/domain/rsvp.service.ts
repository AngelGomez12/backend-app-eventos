import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Guest } from "@/contexts/events/domain/guest.entity";

import { ConfirmRsvpDto } from "../api/dto/confirm-rsvp.dto";

@Injectable()
export class RsvpService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
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
