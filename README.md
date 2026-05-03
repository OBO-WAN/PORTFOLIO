# Francisco Naranjo Portfolio

Multilingual personal portfolio website for **Francisco Naranjo** (Frontend Developer), built with vanilla HTML/CSS/JavaScript and a lightweight PHP mail endpoint.

## Highlights
- **Three locales**: English (`/` and `/en`), German (`/de`), and Spanish (`/es`).
- **Responsive UX**: dedicated desktop/mobile layouts, mobile menu, smooth section navigation, and contact-card carousel.
- **Project showcase** with expandable cards.
- **Contact form flow** with client-side validation, localized messages, and confirmation overlay.
- **Server-side mail handler** (`contact_form_mail.php`) with input sanitization, honeypot field, JSON responses, and method checks.

## Tech Stack
- HTML5
- CSS3 (modular stylesheets per section + mobile variants)
- Vanilla JavaScript (no framework)
- PHP 8+ (mail endpoint)

## Repository Structure
```text
.
├── index.html              # Main (English) entry
├── en/ de/ es/             # Localized pages (home + legal/privacy)
├── css/                    # Section-based stylesheets
├── js/                     # UI behavior, language routing, validation, submit flow
├── assets/                 # Icons, SVGs, images, favicon set
└── contact_form_mail.php   # Contact API endpoint
```

## Local Development
### 1) Run the site
Because the repository includes a PHP endpoint, use a PHP server instead of opening files directly:

```bash
php -S localhost:8000
```

Then open:
- `http://localhost:8000/` (English)
- `http://localhost:8000/de/` (Deutsch)
- `http://localhost:8000/es/` (Español)

### 2) Contact form behavior in local mode
When running on `localhost`/`127.0.0.1`, form submission is intentionally simulated in the frontend (no real email is sent). This allows safe UI testing without mail server setup.

## Production Notes
- Configure `contact_form_mail.php` with valid mailbox settings (`$recipientEmail`, `$fromEmail`) for your deployment.
- Ensure the hosting environment allows PHP `mail()` or replace the endpoint with your SMTP/API provider.
- Serve over HTTPS and keep legal/privacy pages aligned with your region.

## License
No license file is included in this repository. All rights reserved unless the owner publishes a license.
