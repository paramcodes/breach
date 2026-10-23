# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue,
please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities
2. Email the maintainers directly at [SECURITY_EMAIL] with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. Allow up to 72 hours for acknowledgment
4. We'll work with you to understand and resolve the issue
5. Once fixed, we'll publish a security advisory and credit you (if desired)

## Security Considerations

This application handles:

- **User authentication** via Supabase Auth
- **Stream keys** encrypted at rest using `STREAM_KEY_SECRET`
- **Real-time chat** via Supabase Realtime with RLS policies
- **Emote uploads** via presigned R2 URLs (no direct bucket access)
- **Mux webhooks** verified with `MUX_WEBHOOK_SECRET`

### Key security practices

- All database access uses Row Level Security (RLS) policies
- Stream keys are encrypted before storage, never logged
- Mux webhook signatures verified on every request
- Emote uploads use short-lived presigned URLs
- Rate limiting on chat messages and API endpoints
- CSP headers configured in `next.config.ts`
- No secrets in client bundles

## Dependency Security

We use `bun audit` and GitHub Dependabot to monitor for vulnerable dependencies.
Run `bun audit` locally to check.

## Disclosure Timeline

- Day 0: Vulnerability reported
- Day 1-3: Acknowledgment and initial assessment
- Day 7: Status update
- Day 30: Target fix date (may vary by severity)
- Public disclosure after fix is deployed

We appreciate responsible disclosure and will credit researchers in our
security advisories.