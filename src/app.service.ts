import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Buffer } from 'buffer';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

@Injectable()
export class AppService {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // this.model = process.env.OPENAI_MODEL || 'gpt';
  }

  getHello(): string {
    return 'Hello World!';
  }

  async textToSpeech(
    text: string,
  ): Promise<{ buffer: Buffer; filePath: string }> {
    try {
      const response = await this.client.audio.speech.create({
        model: 'gpt-4o-mini-tts',
        voice: 'alloy',
        input: text,
        instructions: 'Speak in a calm and professional tone.',
      });
      console.log(response);

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const audioDir = path.join(__dirname, '..', 'src', 'audio');
      if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

      const fileName = `speech_${Date.now()}.mp3`;
      const filePath = path.join(audioDir, fileName);
      fs.writeFileSync(filePath, buffer);

      return { buffer, filePath };
    } catch (error) {
      console.error('TTS Error:', error);
      throw new InternalServerErrorException('TTS generation failed');
    }
  }

  async chat(code: string): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: 'gpt-5.2',
        instructions: `Think that you're a bug fixer in my company, I need help to resolve a bug of my code. Give me structured message for this code. Use javascript for the process, i need just code as output. no other text.`,
        input: [
          {
            role: 'user',
            content: code,
          },
        ],
      });

      return response.output_text || 'No response generated';
    } catch (error) {
      console.error('AI Error:', error);
      throw new InternalServerErrorException('AI generation failed');
    }
  }
}
