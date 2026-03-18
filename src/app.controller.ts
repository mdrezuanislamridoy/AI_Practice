import { Body, Controller, Get, Header, Post, Res } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('tts')
  async tts(@Body() dto: { text: string }, @Res() res: any) {
    const { buffer, filePath } = await this.appService.textToSpeech(dto.text);
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="speech.mp3"',
      'Content-Length': buffer.length,
      'X-File-Path': filePath,
    });
    res.end(buffer);
  }

  @Post('chat')
  async chat(@Body() dto: { code: string }) {
    return await this.appService.chat(dto.code);
  }
}
