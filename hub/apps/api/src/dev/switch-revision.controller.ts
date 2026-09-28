import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';

interface SwitchRevisionDto {
  revisionTag: string;
}

@Controller('dev/switch-revision')
export class SwitchRevisionController {
  @Post()
  async switchRevision(@Body() dto: SwitchRevisionDto) {
    // Deprecated: This endpoint was for Cloud Run traffic management
    // Now using Cloudflare Workers with automatic deployment via terraform apply
    throw new HttpException(
      'This endpoint is deprecated. Traffic routing is managed by Cloudflare.',
      HttpStatus.GONE,
    );
  }
}
