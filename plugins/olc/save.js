const fs = require("fs").promises;
const {COPYFILE_EXCL} = require("fs").constants;
const path = require("path");
const {randomUUID} = require("crypto");
const game = require("../../src/game");

let saveQueue = Promise.resolve();
const stringify = (object) => JSON.stringify(object, null, "  ") + "\n";

module.exports = function saveWorld() {
  // Capture one coherent snapshot before the first await or a queued save.
  let files;
  try {
    files = [...game.world.areas.values()].flatMap((area) => {
      let directory = area.folderPath || path.join(__dirname, "../../areas", area.folderName);
      return [
        ["area.json", area.serialize()],
        ["rooms.json", [...area.rooms.values()].map((room) => room.serialize())],
        ["map.json", area.map.map((cell) => cell.serialize())]
      ].map(([name, data]) => ({destination: path.join(directory, name), contents: stringify(data)}));
    });
  } catch (error) {
    return Promise.reject(error);
  }

  let operation = saveQueue.then(() => writeSnapshot(files));
  saveQueue = operation.catch(() => {});
  return operation;
};

async function writeSnapshot(files) {
  let suffix = randomUUID();
  let temporaryFiles = files.map((file) => ({
    ...file,
    temporary: `${file.destination}.${suffix}.tmp`,
    backup: `${file.destination}.${suffix}.bak`,
    replaced: false
  }));
  let keepBackups = false;

  try {
    // Wait for every pending write even if one fails, before cleanup/retry.
    let results = await Promise.allSettled(temporaryFiles.map((file) =>
      fs.writeFile(file.temporary, file.contents, {flag: "wx"})));
    let failure = results.find((result) => result.status === "rejected");
    if (failure) throw failure.reason;

    // Preserve the entire old snapshot before replacing any of its files.
    let backupResults = await Promise.allSettled(temporaryFiles.map((file) =>
      fs.copyFile(file.destination, file.backup, COPYFILE_EXCL)));
    let backupFailure = backupResults.find((result) => result.status === "rejected");
    if (backupFailure) throw backupFailure.reason;

    try {
      // Replace complete files only; saves cannot interleave with one another.
      for (let file of temporaryFiles) {
        await fs.rename(file.temporary, file.destination);
        file.replaced = true;
      }
    } catch (error) {
      let rollbackErrors = [];
      for (let file of [...temporaryFiles].reverse().filter((file) => file.replaced)) {
        try {
          // Copy rather than consume backups, so an incomplete rollback keeps
          // the complete previous snapshot available for manual recovery.
          await fs.copyFile(file.backup, file.temporary, COPYFILE_EXCL);
          await fs.rename(file.temporary, file.destination);
        } catch (rollbackError) {
          rollbackErrors.push(rollbackError);
        }
      }
      if (rollbackErrors.length) {
        keepBackups = true;
        throw new AggregateError([error, ...rollbackErrors],
          `World save rollback was incomplete. Backups retained: ${temporaryFiles.map((file) => file.backup).join(", ")}`);
      }
      throw error;
    }
  } finally {
    await Promise.allSettled(temporaryFiles.map((file) => fs.unlink(file.temporary)));
    if (!keepBackups) await Promise.allSettled(temporaryFiles.map((file) => fs.unlink(file.backup)));
  }
}
