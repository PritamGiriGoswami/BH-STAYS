import os
import mimetypes
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote


PROJECT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "web")


def application(environ, start_response):
    """Serve the static site through WSGI hosts that expect an app export."""
    request_path = unquote(environ.get("PATH_INFO", "/"))
    relative_path = request_path.lstrip("/") or "index.html"
    file_path = (Path(PROJECT_DIR) / relative_path).resolve()
    project_path = Path(PROJECT_DIR).resolve()

    if project_path not in file_path.parents or not file_path.is_file():
        start_response("404 Not Found", [("Content-Type", "text/plain; charset=utf-8")])
        return [b"Not Found"]

    content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
    body = file_path.read_bytes()
    start_response("200 OK", [("Content-Type", content_type), ("Content-Length", str(len(body)))])
    return [body]


app = application
handler = app


class BHStaysHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PROJECT_DIR, **kwargs)

    def log_message(self, format, *args):
        # Keep terminal output clean while still serving the site.
        return


def main():
    port = int(os.environ.get("PORT", 8000))
    server = ThreadingHTTPServer(("0.0.0.0", port), BHStaysHandler)
    print(f"BH Stays is running at http://localhost:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
