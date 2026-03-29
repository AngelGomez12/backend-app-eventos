import { Module } from "@nestjs/common";

import { RsvpController } from "./api/rsvp.controller";

@Module({
  controllers: [RsvpController],
})
export class RsvpModule {}
