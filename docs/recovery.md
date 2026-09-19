# Recovery notes

This recovery reconnects existing engine features and repairs the paths needed to play and edit the old world. It does not attempt to finish every historical experiment.

## What happened

The current code lineage begins at `fcd5e1a` (September 24, 2016). Git also retains a separate 2015 root, `a8bf549`; that history is not an ancestor of the current `master` and was not merged into this recovery.

The main break was an incomplete transition from a scripted world to JSON areas:

| Commit | Verified change and consequence |
| --- | --- |
| `e9f21c9` — June 23, 2017 | Introduced dialogue menus but removed the guard's completion assignment. A later turn-in could try to hand over a key that was already gone. |
| `4177d56` — June 30, 2017 | Introduced message templates with mismatched actor/recipient placeholders in inventory messages. |
| `636295e` — December 9, 2017 | Added formatting methods whose argument arrays leaked into subsequent calls within the same template. |
| `21b43f5` — March 10, 2018 | Disabled the old world initializer and enabled the JSON loader. The new path loaded rooms and exits but did not recreate the guard, items, or doors. Most of the old world stopped being reachable at startup. |
| `a7d29b6` — March 10, 2018 | Added area saving with `await [promises]`, which reported completion before filesystem writes finished. Map cells gained serialization, but the programmatic central room still created a plain object. |
| `cb6ba10` — March 10, 2018 | Added deletion with a call to nonexistent `character.execute`, breaking removal of rooms occupied by other players. |
| `f760b90` — August 21, 2018 | Removed the character-to-owner backlink required by NPC behaviours. The earlier portfolio update, `1ca609d`, restored that link and a small guide dialogue. |

Other defects were unfinished behaviour rather than later regressions: mole mode could create malformed exits from invalid direction input, the initial editor treated room ID `0` as “no ID,” and its optional argument still required whitespace. TCP input also treated each received chunk as a complete command. These paths now validate input and handle complete lines explicitly.

## Restored world and session rules

The JSON world contains the **35 connected historical rooms**, the guide, guard, wandering bird, sword, cherry, key, and boat. Gate locking, automatic opening during movement, one-way routes, and boat-dependent water travel use the existing mechanics. The old `bushes` and `hut` declarations had no connections; no new route has been invented for them.

The guard's sword-for-key quest is **shared for one server run**. Returning the designated sword can award the existing key once; another player can continue if necessary, and full inventory does not falsely complete the reward. Gate state is shared. Dialogues still have independent reply menus per player.

Disconnecting removes the player and drops their carried items in their last room. Items do not return to their starting locations; a key or boat stranded behind a locked gate may require a restart. Restarting recreates NPCs and items at their declared locations and resets quest progress, inventories, and door state. There are no accounts or persistent player saves.

## Editing and persistence

`area.json` holds startup NPC, item, and door definitions. Map exits refer to stable door IDs; both sides resolve to one runtime door. Item references are resolved during loading, and missing startup references fail before a partial world is registered.

`save world` persists room text, surfaces, topology, and startup definitions. It does **not** capture current item locations, NPC movement, quest progress, or opened gates. Editor deletion protects recall/spawn rooms, NPC-occupied rooms, and door endpoints; deleting other rooms recalls their players and moves loose items to the recall room.

Saves capture a snapshot, queue concurrent requests, finish temporary-file writes, and back up the previous files before replacing them. If replacement fails, the server rolls back files already replaced and reports failure. If rollback also fails, it retains the complete old snapshot as `.bak` files and logs their paths for manual recovery. Successful saves and rollbacks remove their temporary files and backups. This is **not a crash-safe transaction** across `area.json`, `rooms.json`, and `map.json`: process termination during replacement or rollback may still require recovery from the backups.

## Verification and boundaries

Run `npm test` using Node's built-in test runner. Coverage includes fragmented UTF-8 and LF/CRLF input, dialogue and quest flows, inventory transfers and disconnects, doors and water travel, editor validation, and save/restart round trips. Persistence tests use temporary worlds and exercise delayed writes, concurrent saves, failed writes/replacements, successful rollback, and backup retention when rollback fails.

The TCP integration test launches separate server processes on OS-assigned ports, using temporary copies of the area files. Set `WORLD_DIR=/path/to/areas` to run your own isolated world. Graceful input EOF drains complete queued lines; unfinished lines are discarded and unanswered editor prompts are cancelled. User-supplied chat text keeps its case and literal dollar signs.

Trading/economics, account permissions, persistent characters, and new game systems remain outside this recovery. Every connected player can still use the editor; this remains a local prototype.
