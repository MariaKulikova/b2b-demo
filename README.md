# Car Dealer Demo

A modern React application for a car dealership website featuring:

- Car inventory browsing with filtering
- Responsive design with Tailwind CSS  
- Test drive booking functionality
- Contact integration (phone, WhatsApp)
- BDD testing with Cucumber & Playwright

## Voice Assistant Providers

The embedded voice assistant can now switch between ElevenLabs and LiveKit:

- Set `VITE_VOICE_ASSISTANT_PROVIDER=elevenlabs` (default) to use the existing ElevenLabs flow. This path keeps the session manager and passes `availableCars` to the agent.
- Set `VITE_VOICE_ASSISTANT_PROVIDER=livekit` to enable the LiveKit experience based on the `agent-starter-embed` example. In this mode the assistant fetches LiveKit connection details from `VITE_LIVEKIT_CONN_DETAILS_ENDPOINT` and does **not** use `sessionId` or `availableCars`.

When using LiveKit, configure the following environment variables:

```env
VITE_LIVEKIT_CONN_DETAILS_ENDPOINT=https://your-token-server/api/connection-details
VITE_LIVEKIT_AGENT_NAME=demo-agent           # optional
VITE_LIVEKIT_SANDBOX_ID=sandbox_123abc       # optional
```

See `ENV_SETUP.md` for more details.

## GitHub Pages Fix

This update ensures proper deployment from the `dist/` folder via GitHub Actions instead of serving development files from the repository root.

## Development

```bash
pnpm install
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm test     # Run BDD tests
```

The site is deployed at: https://demo.shiftgears.ai/
