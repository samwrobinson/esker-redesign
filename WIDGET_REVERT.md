# Chat Widget + Phone Field — A2P Verification (Temporary)

**Status:** Temporary A2P-verification widget is live on the **home page only**, and the
phone field has been removed from the home page contact form.
**Files touched:**
- `src/_includes/layouts/base.html` (just above `</body>`) — chat widget swap.
- `src/index.html` (Homepage Contact form, ~line 427) — phone field commented out.

## What's going on right now
- A **temporary widget** (`data-widget-id="6a2c236d95a221ced53c199d"`, `data-source="WEB_USER"`)
  is loaded **only on the home page** (`{% if page.url == '/' %}`). This exists to A2P-verify
  the GHL master sending sub account.
- The **original widget** (`data-widget-id="69c65957bf76e306427df7f8"`) is **commented out**
  with a Nunjucks `{# ... #}` block, preserved verbatim. It normally loads on every page
  except `/fb/` and `/fb-alt/`.

## To revert (one prompt)
> "Revert the widget changes per WIDGET_REVERT.md."

Which means:
1. Delete the temporary widget block (the `{% if page.url == '/' %}` script + its surrounding
   `TEMPORARY:` comment) from `src/_includes/layouts/base.html`.
2. Uncomment the original widget block (remove the `{# ORIGINAL widget ... #}` wrapper so the
   `{% if page.url != '/fb/' and page.url != '/fb-alt/' %}` script is live again).
3. In `src/index.html`, restore the phone field on the Homepage Contact form by removing the
   `<!-- TEMPORARY: phone field removed ... -->` comment wrapper so the
   `<input ... name="phone" placeholder="Phone">` is live again.
4. Delete this file (`WIDGET_REVERT.md`).

After reverting, the original widget should again show on all pages except `/fb/` and `/fb-alt/`,
and the temporary one should be gone entirely.
