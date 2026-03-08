# Logo placement

Two logo images are used:

| File | Used in |
|------|--------|
| **`public/logo.png`** | Navbar (top left), Footer (small), Favicon (browser tab) |
| **`public/logo-hero.png`** or **`public/logo-hero.svg`** | Home page hero (main central logo) |

## Where to put your logos

In your project, open the **`public`** folder:

1. **`public/logo.png`** — icon/small logo for navbar, footer, and favicon.
2. **Hero logo** — use **either**:
   - **`public/logo-hero.svg`** — **best quality:** vector format, stays sharp at any size (recommended if you have the logo as SVG).
   - **`public/logo-hero.png`** — use a **high-resolution** file (at least **880px wide**) so it doesn’t look blurry when enlarged. If the PNG is small, it will look soft when scaled up.

**Sizing tips:**

- **logo.png:** Compact mark for nav and footer; same file is used for the tab icon.
- **logo-hero:** Prefer **logo-hero.svg** for crisp scaling. If you only have PNG, export or use a version that’s at least 880px wide so it stays sharp at the hero size.

After adding or replacing either file, restart the dev server and hard-refresh the browser (Ctrl+Shift+R) if you don’t see the update.
