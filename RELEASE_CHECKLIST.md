# HeptaSign Release Checklist

## Closed in current hardening pass

- UI foundation: shared buttons, cards, alerts, metadata rows, empty states.
- Main shell: cleaner navigation, current user/title display, responsive wrapping.
- Dashboard: stronger KPI cards and recent signed document empty state.
- Documents list: cleaner filters, responsive table, empty state.
- Document create/detail/sign pages: consistent layout and action areas.
- Public verification pages: clearer result cards and safer public metadata surface.
- Admin users: business title field for new users and editable title for existing users.
- Document assignment: documents can be sent to selected internal users for signing.
- Visibility rules: non-admin users only see documents they created or documents assigned to them.
- Branding: Heptapus logo is used in the UI and overlaid in stamped PDF QR codes.
- POST redirect behavior: changed to `303 See Other` to avoid `Server action not found` after form submits.
- PDF stamp: switched to TTF font and added QR marker to every original page.
- Local Docker: separate compose file without external Caddy network.

## Must close before real production use

- Replace default `.env` secrets and admin password.
- Add HTTPS/domain `APP_URL` in production.
- Replace default Postgres credentials.
- Confirm production Caddy external Docker network name.
- Add backup/restore procedure for Postgres volume and signed file volume.
- Add formal retention policy for original and signed PDFs.
- Add account disable/delete flow instead of only creating users.
- Add audit log viewer and filters for admins.
- Add document supersede flow, not only revoke.
- Add email/notification delivery for assignment events if internal SMTP is available.
- Add multi-step signing policy if documents must require all assigned users to sign.
- Add stricter upload feedback and optional virus scanning hook.
- Add rate limiting for login and public verification.
- Add automated smoke tests for login, upload, sign, verify, revoke.

## Later hardening

- Add more granular per-document download permission controls.
- Add structured signer profile history so old signatures keep historical titles.
- Add optional second approval/checker workflow.
- Add exportable audit report.
- Add object storage provider interface for S3-compatible storage.
- Add post-quantum signature provider implementation when a mature, lightweight NIST-standardized library is appropriate.
