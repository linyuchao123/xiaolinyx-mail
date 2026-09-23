#!/usr/bin/env python3
"""Create the first administrator without putting credentials in shell history."""
import getpass
import json
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

URL = "https://mail.xiaolinyx.me/api/register"
email = "admin@xiaolinyx.me"

def main():
    secret = getpass.getpass("Worker initialization secret: ")
    password = getpass.getpass("New administrator password: ")
    confirmation = getpass.getpass("Repeat administrator password: ")
    if not secret or password != confirmation or not 6 <= len(password) <= 30:
        raise SystemExit("Secret required; password must match and contain 6–30 characters.")
    req = Request(
        URL,
        data=json.dumps({"email": email, "password": password}).encode(),
        headers={"Content-Type": "application/json", "X-Init-Secret": secret},
        method="POST",
    )
    try:
        with urlopen(req, timeout=30) as response:
            result = json.load(response)
    except HTTPError as exc:
        raise SystemExit(f"HTTP {exc.code}: {exc.read().decode(errors='replace')}") from exc
    except URLError as exc:
        raise SystemExit(f"Cannot reach {URL}: {exc.reason}") from exc
    if result.get("code") != 200:
        raise SystemExit(result.get("message", "Administrator creation failed"))
    print(f"Created {email}. Sign in at https://mail.xiaolinyx.me.")

if __name__ == "__main__":
    main()
