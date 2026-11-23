"""Local-only visual QA, including script failures; never deployed to Pages.

python tests/preview_server.py
/?qa=no-gsap omits the motion libraries, /?qa=no-scripts omits all scripts.
/?qa=motion-on simulates no reduced-motion preference in this local test page only.
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
import re

DIST = Path(__file__).resolve().parents[1] / 'dist'

class Preview(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)

    def do_GET(self):
        url = urlsplit(self.path)
        mode = parse_qs(url.query).get('qa', [''])[0]
        if url.path == '/__qa__/motion-on.js':
            data = b"""// Local QA only. Never included in the production static assets.
const nativeMedia = window.matchMedia.bind(window);
window.matchMedia = query => query === '(prefers-reduced-motion: reduce)'
  ? {matches:false,media:query,addEventListener(){},removeEventListener(){}}
  : nativeMedia(query);
"""
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        if url.path == '/' and mode in ('no-gsap', 'no-scripts', 'motion-on'):
            html = (DIST / 'index.html').read_text(encoding='utf-8')
            if mode == 'motion-on':
                html = html.replace('<script src="motion.js', '<script src="/__qa__/motion-on.js"></script><script src="motion.js')
            else:
                pattern = r'<script\b[^>]*>.*?</script>' if mode == 'no-scripts' else r'<script\b[^>]*src="(?:vendor/[^"\s]+|motion\.js[^"\s]*)"[^>]*>.*?</script>'
                html = re.sub(pattern, '', html, flags=re.S)
            data = html.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        super().do_GET()

if __name__ == '__main__':
    print('Local QA: http://127.0.0.1:8766', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8766), Preview).serve_forever()
