# Voice Server

Outbound calling server using ElevenLabs Conversational AI and Twilio.

https://github.com/user-attachments/assets/f2639b6f-c0b4-4427-8048-1d197e2d1f50

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

3. Run the server:
   ```bash
   bun run dev
   ```

## TODO

- [ ] Remove delay after tool call (don't wait for result)
- [ ] Wait for reply before ending the call
- [ ] Improve response style (concise but casual)
- [ ] Maintain consistency
  - [ ] Proper pausing
  - [ ] Slower number pronunciation
  - [ ] Reiterate agreed callback times
  - [ ] Handle call termination properly
- [ ] Implement remaining tools
- [ ] Dynamic currency locale based on currency field

## References

- [ElevenLabs Twilio Outbound Calling Guide](https://elevenlabs.io/docs/conversational-ai/guides/twilio/outbound-calling)
