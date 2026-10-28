"""Write members-portal/index.html: the website's Members Portal page.

The page is the website's own header and footer, taken from index.html so
they always match it, around the Members Portal system (members-portal/app/).
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
    html = re.sub(r'(src|href)="(assets|css|js)/', r'\1="../\2/', html)
    # Back to top is the top of this page.
    html = html.replace('href="../#top" class="to-top"', 'href="#" class="to-top"')
    # The Members Portal link is this page.
    html = html.replace('href="members-portal/"', 'href="./" aria-current="page"')
    return html


head_links = '\n'.join('  ' + l.strip() for l in site.splitlines()
                       if re.search(r'rel="(icon|preconnect|stylesheet)"|fonts\.googleapis\.com/css', l))
header = up(part('<header class="nav" id="nav">', '</header>'))
footer = up(part('<footer class="footer" id="siteFooter">', '</footer>'))

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
</head>
<body class="page-portal">
  <div class="scroll-progress" id="scrollProgress"></div>

  <!-- Navigation: the website's own, from index.html -->
  {header}

  <main>
    <section class="portal-head" id="portalHead" aria-label="Members Portal">
      <div class="container">
        <p class="portal-kicker">Members Portal</p>
        <h1>The shared crop calendar</h1>
        <p class="portal-sub">Member farms sign in to plan their plantings from nursery to harvest. The secretariat approves every account and sees every farm's calendar.</p>
      </div>
    </section>
    <section class="portal-stage" aria-label="Crop calendar">
      <iframe class="portal-frame" id="portalFrame" src="app/" title="TIPFA Members Portal: the crop calendar"
              allow="fullscreen; clipboard-write" allowfullscreen></iframe>
    </section>
  </main>

  {footer}

  <script src="../js/main.js"></script>
  <script>
    // The calendar fills the screen below the website's header.
    (function () {{
      var root = document.documentElement;
      function fit() {{
        var nav = document.getElementById('nav'), frame = document.getElementById('portalFrame');
        root.style.setProperty('--navh', (nav ? nav.offsetHeight : 64) + 'px');
        var top = frame.getBoundingClientRect().top + window.scrollY;
        frame.style.height = Math.max(520, window.innerHeight - top) + 'px';
      }}
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
