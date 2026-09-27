import { Module } from "@nestjs/common";
import { TelemetryController } from "./telemetry.controller";
import { CloudLoggingService } from "../logging/cloud-logging.service";

@Module({
  controllers: [TelemetryController],
  providers: [CloudLoggingService],
  exports: [CloudLoggingService],
})
export class TelemetryModule {}
