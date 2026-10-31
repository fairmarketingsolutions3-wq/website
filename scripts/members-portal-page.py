"""Write members-portal/index.html: the website's Members Portal page.

The page is the website's own header, taken from index.html so it always
matches it, above the Members Portal system (members-portal/app/). It has no
footer: the system fills the screen to the bottom.
Run by scripts/build-members-portal.sh; it reads and writes only these files.
"""
import re
import sys

SITE = 'index.html'
OUT = 'members-portal/index.html'

site = open(SITE, encoding='utf-8').read()


def part(start, end):
    i = site.index(start)
    j = site.index(end, i) + len(end)
    return site[i:j]


def up(html):
    """Point the website's links and pictures one folder up, from members-portal/."""
    html = re.sub(r'href="#', 'href="../#', html)
    html = re.sub(r'(src|href)="(assets|css|js|platform)/', r'\1="../\2/', html)
    # Back to top is the top of this page.
    html = html.replace('href="../#top" class="to-top"', 'href="#" class="to-top"')
    # The Members Portal link is this page.
    html = html.replace('href="members-portal/"', 'href="./" aria-current="page"')
    return html


head_links = '\n'.join('  ' + l.strip() for l in site.splitlines()
                       if re.search(r'rel="(icon|preconnect|stylesheet)"|fonts\.googleapis\.com/css', l))
header = up(part('<header class="nav" id="nav">', '</header>'))

# Light or dark: a moon button beside the Members Portal button, and on phones
# beside the menu, where the header buttons are folded away.
THEME_ICONS = (
    '<svg class="ti-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" '
    'stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
    '<svg class="ti-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" '
    'stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4'
    'M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>')


def theme_button(extra=''):
    return (f'<button type="button" class="theme-toggle{extra}" aria-pressed="false" '
            f'aria-label="Dark mode" title="Dark mode">{THEME_ICONS}</button>')


assert header.count('<div class="btn-cta-wrap">') == 1 and header.count('<button class="nav-toggle"') == 1
header = header.replace('<div class="btn-cta-wrap">', '<div class="btn-cta-wrap">\n        ' + theme_button())
header = header.replace('<button class="nav-toggle"', theme_button(' theme-toggle--menu') + '\n      <button class="nav-toggle"')

page = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Members Portal | TIPFA, Tanzania Indoor &amp; Professional Farmers Association</title>
  <meta name="description" content="The TIPFA Members Portal: member farms plan their plantings on the shared crop calendar, from nursery to harvest, and the secretariat sees every farm's calendar.">
  <meta name="theme-color" content="#405E35">
  <link rel="canonical" href="https://fairmarketingsolutions3-wq.github.io/website/members-portal/">
{up(head_links)}
  <script>
    // Light or dark, as chosen on this device, before the first paint.
    try {{ if (localStorage.getItem('tipfa-theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); }} catch (e) {{}}
  </script>
</head>
<body class="page-portal">
  <div class="scroll-progress" id="scrollProgress"></div>

  <!-- Navigation: the website's own, from index.html -->
  {header}

  <main>
    <h1 class="visually-hidden">TIPFA Members Portal</h1>
    <section class="portal-stage" aria-label="Crop calendar">
      <iframe class="portal-frame" id="portalFrame" src="app/" title="TIPFA Members Portal: the crop calendar"
              allow="fullscreen; clipboard-write" allowfullscreen></iframe>
    </section>
  </main>

  <script src="../js/main.js"></script>
  <script>
    // The calendar fills the screen below the website's header.
    (function () {{
      var root = document.documentElement;
      var frame = document.getElementById('portalFrame'), away = false;
      function fit() {{
        var nav = document.getElementById('nav');
        var h = away ? 0 : (nav ? nav.offsetHeight : 64);
        root.style.setProperty('--navh', h + 'px');
        // Below the header and the orange rule under it.
        frame.style.height = Math.max(420, window.innerHeight - h - (away ? 0 : 3)) + 'px';
      }}
      // On a phone the website's header steps aside while the calendar is
      // scrolled down, and comes back as soon as it is scrolled up.
      function navAway(a) {{
        if (a === away) return;
        away = a; document.body.classList.toggle('nav-away', a); fit();
      }}
      frame.addEventListener('load', function () {{
        var w, last = 0;
        try {{ w = frame.contentWindow; w.addEventListener('scroll', function () {{
          var y = w.scrollY;
          if (window.innerWidth > 900) {{ navAway(false); last = y; return; }}
          if (y > last + 6 && y > 80) navAway(true);
          else if (y < last - 6 || y < 40) navAway(false);
          last = y;
        }}, {{ passive: true }}); }} catch (e) {{}}
      }});
      // Light or dark: the page and the system inside it change together.
      function setTheme(t) {{
        if (t === 'dark') root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
        try {{ localStorage.setItem('tipfa-theme', t); }} catch (e) {{}}
        try {{ var w = document.getElementById('portalFrame').contentWindow; if (w && w.tipfaTheme) w.tipfaTheme(t); }} catch (e) {{}}
        showTheme();
      }}
      function showTheme() {{
        var dark = root.getAttribute('data-theme') === 'dark';
        document.querySelectorAll('.theme-toggle').forEach(function (b) {{
          b.setAttribute('aria-pressed', dark ? 'true' : 'false');
          b.title = dark ? 'Light mode' : 'Dark mode';
          b.setAttribute('aria-label', b.title);
        }});
      }}
      document.querySelectorAll('.theme-toggle').forEach(function (b) {{
        b.addEventListener('click', function () {{ setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); }});
      }});
      showTheme();
      window.addEventListener('resize', fit);
      window.addEventListener('load', fit);
      fit();
    }})();
  </script>
</body>
</html>
'''

open(OUT, 'w', encoding='utf-8').write(page)
print('Wrote', OUT, file=sys.stderr)
