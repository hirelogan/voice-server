# Voice Server

Reference docs: https://elevenlabs.io/docs/conversational-ai/guides/twilio/outbound-calling

## ToDo

- Remove huge delay after tool call
  - Don't wait for the result
- Wait the reply before ending the call
- Don't waffle
- Maintain the consistency
  - Pausing where it should pause
  - Numbers are spelled out too fast (replaced with words)
- Implement the rest of the tools
- Change currencty locale depending on currency field (currency in the prompt is not always pounds)
