import importlib.util
import io
import json
import os
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest.mock import patch, MagicMock

from release import package, FILES, DIRECTORIES

spec = importlib.util.spec_from_file_location("actions_deploy", Path(__file__).with_name("from-actions.py"))
actions = importlib.util.module_from_spec(spec)
spec.loader.exec_module(actions)


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        for name in FILES:
            (self.root / name).write_text("{}\n")
        for directory in DIRECTORIES:
            (self.root / directory).mkdir()
            (self.root / directory / "example.js").write_text("module.exports = {};\n")
        self.output = self.root / "artifacts/release"
        self.commit = "a" * 40

    def test_archive_is_deterministic_and_excludes_unrelated_files(self):
        (self.root / ".env").write_text("PRIVATE_VALUE=not-for-deploy")
        (self.root / "README.md").write_text("Documentation")
        first = package(self.root, self.output, self.commit, "123")
        initial = (self.output / first["archive"]).read_bytes()
        second = package(self.root, self.output, self.commit, "123")
        self.assertEqual(first, second)
        self.assertEqual(initial, (self.output / second["archive"]).read_bytes())
        with tarfile.open(fileobj=io.BytesIO(initial), mode="r:gz") as archive:
            self.assertNotIn(".env", archive.getnames())
            self.assertNotIn("README.md", archive.getnames())
            self.assertEqual(json.load(archive.extractfile("release.json")), {"commit": self.commit, "run_id": "123"})
            self.assertTrue(all(entry.isfile() and entry.mode == 0o644 for entry in archive))

    def test_symlink_and_unexpected_runtime_files_are_rejected(self):
        bad = self.root / "src/link.js"
        bad.symlink_to(self.root / "index.js")
        with self.assertRaisesRegex(ValueError, "Symlink"):
            package(self.root, self.output, self.commit, "123")
        bad.unlink()
        (self.root / "src/.env").write_text("private")
        with self.assertRaisesRegex(ValueError, "Unexpected runtime file"):
            package(self.root, self.output, self.commit, "123")

    def test_release_identifiers_are_validated(self):
        for commit, run in [("../escape", "1"), (self.commit, "1;id"), (self.commit, "")]:
            with self.assertRaises(ValueError):
                package(self.root, self.output, commit, run)

    def test_modified_archive_is_rejected_before_ssh(self):
        manifest = package(self.root, self.output, self.commit, "123")
        (self.output / manifest["archive"]).write_bytes(b"modified")
        original_cwd = Path.cwd()
        self.addCleanup(os.chdir, original_cwd)
        os.chdir(self.root)
        with patch.dict(os.environ, {"GITHUB_SHA": self.commit, "GITHUB_RUN_ID": "123"}):
            with patch.object(actions.subprocess, "run") as ssh:
                with self.assertRaisesRegex(ValueError, "checksum"):
                    actions.main()
                ssh.assert_not_called()

    def test_artifact_from_another_run_is_rejected(self):
        package(self.root, self.output, self.commit, "123")
        original_cwd = Path.cwd()
        self.addCleanup(os.chdir, original_cwd)
        os.chdir(self.root)
        with patch.dict(os.environ, {"GITHUB_SHA": self.commit, "GITHUB_RUN_ID": "124"}):
            with self.assertRaisesRegex(ValueError, "does not belong"):
                actions.main()

    def test_probe_waits_for_full_utf8_welcome_and_rejects_wrong_service(self):
        welcome = "Алтарь храма\n> ".encode()
        client = MagicMock()
        client.recv.side_effect = [welcome[:1], welcome[1:7], welcome[7:], b"Language switched to English.\n", b"Exits: north.\n> "]
        with patch.object(actions.socket, "create_connection") as connect:
            connect.return_value.__enter__.return_value = client
            actions.probe("localhost", 7000)
            self.assertEqual(client.sendall.call_args_list[0].args, (b"language en\nlook\n",))
            self.assertEqual(client.sendall.call_args_list[1].args, (b"quit\n",))
            client.recv.side_effect = [b"HTTP/1.1 200 OK\r\n", b""]
            with self.assertRaisesRegex(RuntimeError, "language and look"):
                actions.probe("localhost", 7000)


if __name__ == "__main__":
    unittest.main()
