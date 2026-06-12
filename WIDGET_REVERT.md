# Chat Widget — A2P Verification (Temporary)

**Status:** Temporary A2P-verification widget is live on the **home page only**. The home page
now has **no phone/SMS opt-in form**, so it won't conflict with the widget during A2P review.

**The only temporary change is the widget swap** (below). The video/form move and popup removal
are permanent (see "Permanent changes" — do not revert those).

**File for the temporary change:** `src/_includes/layouts/base.html` (just above `</body>`).

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
3. Delete this file (`WIDGET_REVERT.md`).

After reverting, the original widget shows on all pages except `/fb/` and `/fb-alt/`, and the
temporary one is gone. Once verified, the phone field + widget can coexist on the same page —
A2P only checks for multiple opt-ins at registration time.

## Permanent changes (do NOT revert)
These were intentional moves to clear the "multiple opt-ins" A2P rejection and are meant to stay:
- **Video + contact form moved to the About page.** The `#video-548` section (video + inline
  quote form) was removed from `src/index.html` and added to `src/content/pages/about.html`,
  right after the intro side-by-side section. Its styles were copied into `src/assets/less/about.less`
  (compile with `npm run build:less`). The form keeps its phone field there since `/about/` has no
  chat widget. The form's Netlify `name` was changed from "Homepage Contact" to "About Contact".
- **Testimonial popup removed from the home page.** The `#testimonial-popup` markup and its
  show/close JS were deleted from `src/index.html`. The video-testimonials carousel and its
  play-tracking still work; only the popup (which collected a phone number) is gone.
