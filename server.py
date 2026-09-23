import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))


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
