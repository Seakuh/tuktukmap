import { Module } from '@nestjs/common';
import { TukTukGateway } from './tuktuk.gateway';

@Module({
  providers: [TukTukGateway],
})
export class AppModule {}
