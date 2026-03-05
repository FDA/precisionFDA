#!/usr/bin/env python3
import os
import json
import base64
import requests
import sys
from urllib.parse import urlparse


def exchange_cli_token(code: str, api_url: str) -> dict:
    try:
        # Only skip SSL verification for localhost (self-signed cert)
        hostname = urlparse(api_url).hostname
        skip_verify = hostname in ("localhost", "127.0.0.1")

        # Send POST request
        job_dxid = os.environ.get("DX_JOB_ID")
        response = requests.post(
            f"{api_url}/api/v2/cli/token/exchange",
            headers={"User-Agent": f"pfda-job/{job_dxid}"},
            json={"code": code},
            verify=not skip_verify,
        )
        response.raise_for_status()

        # Get base64-encoded response
        base64_string = response.json().get("exchangeToken")

        # Decode: base64 -> UTF-8 string -> JSON object
        decoded_json = base64.b64decode(base64_string).decode("utf-8")
        cli_configs = json.loads(decoded_json)

        return cli_configs
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print("An error occurred during token exchange.")
        sys.exit(1)


if __name__ == "__main__":
    try:
        token = ""
        server_url = ""
        with open("/home/dnanexus/job_input.json", "r") as f:
            job_input = json.load(f)
            token = job_input.get("__pfda_cli_code")
            server_url = job_input.get("__pfda_server_url")

        cli_configs = exchange_cli_token(token, server_url)

        with open("/home/dnanexus/.pfda_config", "w") as f:
            json.dump(cli_configs, f, indent=2)
    except Exception as e:
        print(f"Error during setup: {e}", file=sys.stderr)
        sys.exit(1)
