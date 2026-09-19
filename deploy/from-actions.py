#!/usr/bin/env python3
"""Send the checked artifact through the dedicated, host-pinned SSH identity."""
import hashlib
import json
import os
from pathlib import Path
import re
import socket
import subprocess
import tempfile
import time


def probe(host, port):
    with socket.create_connection((host, port), timeout=10) as client:
        client.settimeout(10)
        client.sendall(b"language en\nlook\n")
        output = b""
        while len(output) < 65536:
            chunk = client.recv(4096)
            if not chunk:
                break
            output += chunk
            if b"Language switched to English." in output and (b"Exits:" in output or b"No exits." in output):
                client.sendall(b"quit\n")
                return
        raise RuntimeError("Public TCP endpoint did not respond to language and look")


def main():
    directory = Path("artifacts/release")
    manifest = json.loads((directory / "manifest.json").read_text())
    commit, run_id = manifest["commit"], str(manifest["run_id"])
    if commit != os.environ["GITHUB_SHA"] or run_id != os.environ["GITHUB_RUN_ID"]:
        raise ValueError("Artifact does not belong to this workflow run")
    release = f"flageolet-{commit}-{run_id}"
    if not re.fullmatch(r"flageolet-[0-9a-f]{40}-[1-9][0-9]{0,19}", release) or manifest["release"] != release:
        raise ValueError("Invalid release identity")
    if manifest["archive"] != release + ".tar.gz":
        raise ValueError("Invalid archive filename")
    archive = directory / manifest["archive"]
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    if digest != manifest["sha256"]:
        raise ValueError("Archive checksum mismatch")
    target = os.environ["DEPLOY_SSH_TARGET"]
    if not re.fullmatch(r"[a-z_][a-z0-9_-]*@[A-Za-z0-9.-]+", target):
        raise ValueError("Invalid SSH target")
    print(f"::add-mask::{target.split('@')[1]}", flush=True)
    with tempfile.TemporaryDirectory(prefix="flageolet-ssh-") as temporary:
        key = Path(temporary) / "identity"
        known_hosts = Path(temporary) / "known_hosts"
        for file, value in [(key, os.environ["DEPLOY_SSH_KEY"]), (known_hosts, os.environ["DEPLOY_KNOWN_HOSTS"])]:
            file.write_text(value.rstrip() + "\n")
            file.chmod(0o600)
        with archive.open("rb") as source:
            subprocess.run([
                "ssh", "-T", "-i", str(key), "-o", "IdentitiesOnly=yes",
                "-o", "BatchMode=yes", "-o", "StrictHostKeyChecking=yes",
                "-o", f"UserKnownHostsFile={known_hosts}", "-o", "ConnectTimeout=15",
                "-o", "ServerAliveInterval=15", "-o", "ServerAliveCountMax=4",
                target, f"deploy {release} {digest}"
            ], stdin=source, check=True, timeout=180)
    host = os.environ["DEPLOY_PUBLIC_HOST"]
    port = int(os.environ.get("DEPLOY_PUBLIC_PORT", "7000"))
    for attempt in range(5):
        try:
            probe(host, port)
            break
        except (OSError, RuntimeError):
            if attempt == 4:
                raise
            time.sleep(2)
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a") as stream:
            stream.write(f"Deployed `{commit}` and verified the public TCP language/look commands.\n")


if __name__ == "__main__":
    main()
