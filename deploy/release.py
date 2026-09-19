#!/usr/bin/env python3
"""Package only the dependency-free server and initial world for deployment."""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import subprocess
import tarfile

FILES = ("index.js", "package.json", "package-lock.json", ".node-version")
DIRECTORIES = ("src", "commands", "messages", "ai", "plugins", "areas")


def package(root, output, commit, run_id):
    if not re.fullmatch(r"[0-9a-f]{40}", commit) or not re.fullmatch(r"[1-9][0-9]{0,19}", run_id):
        raise ValueError("Expected a full commit SHA and numeric run ID")
    release = f"flageolet-{commit}-{run_id}"
    files = [root / name for name in FILES]
    for directory in DIRECTORIES:
        files.extend(sorted((root / directory).rglob("*")))
    contents = {}
    for file in files:
        if file.is_symlink():
            raise ValueError(f"Symlink not allowed: {file}")
        if file.is_dir():
            continue
        name = file.relative_to(root).as_posix()
        if not file.is_file() or (name not in FILES and file.suffix not in (".js", ".json")):
            raise ValueError(f"Unexpected runtime file: {name}")
        contents[name] = file.read_bytes()
    contents["release.json"] = (json.dumps({"commit": commit, "run_id": run_id}, sort_keys=True) + "\n").encode()
    output.mkdir(parents=True, exist_ok=True)
    archive = output / f"{release}.tar.gz"
    # Stable timestamps/ownership make retries of a run identical.
    with archive.open("wb") as raw, gzip.GzipFile(fileobj=raw, mode="wb", filename="", mtime=0) as compressed:
        with tarfile.open(fileobj=compressed, mode="w") as tar:
            for name, data in sorted(contents.items()):
                info = tarfile.TarInfo(name)
                info.size = len(data)
                info.mode = 0o644
                tar.addfile(info, io.BytesIO(data))
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    manifest = {"release": release, "commit": commit, "run_id": run_id, "sha256": digest, "archive": archive.name}
    (output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--run-id", required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    subprocess.run(["git", "diff", "--exit-code", "HEAD", "--", *FILES, *DIRECTORIES], cwd=root, check=True, stdout=subprocess.DEVNULL)
    untracked = subprocess.check_output(["git", "ls-files", "--others", "--", *FILES, *DIRECTORIES], cwd=root, text=True)
    if untracked:
        parser.error("Commit or remove untracked runtime files before packaging")
    commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip()
    print(json.dumps(package(root, args.output, commit, args.run_id)))
