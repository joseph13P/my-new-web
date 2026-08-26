# Telegram Login Privacy snippet

This project stores only the minimal Telegram fields provided by the Telegram Login Widget after server-side verification. Stored fields:

- telegramId (stable numeric id)
- username (optional)
- firstName, lastName
- photoUrl
- lastAuthAt
- consentAt
- rawPayload (JSON) - only if explicitly enabled; consider encrypting this field and avoid storing it unless necessary.

Data handling requirements:
- Record explicit consent_at on login.
- Use telegramId (not username) as the stable identifier.
- Verify the widget payload server-side using your bot token and reject stale auth_date.
- Never share Telegram Passport data without explicit consent and strong encryption / legal review.
