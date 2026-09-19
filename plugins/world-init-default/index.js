const fs = require("fs");
const path = require("path");
const TempleGuideAI = require("../../ai/temple-guide");
const GuardAI = require("../../ai/guard");
const BirdAI = require("../../ai/bird");

const behaviours = {guide: TempleGuideAI, guard: GuardAI, bird: BirdAI};

module.exports = function worldInitDefaultPlugin({Area, Room, Character, Item, game, areasDirectory = path.join(__dirname, "../../areas")}) {
  let definitions = fs.readdirSync(areasDirectory, {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      let directory = path.join(areasDirectory, entry.name);
      let read = (name) => JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
      return {directory, folderName: entry.name, area: read("area.json"), rooms: read("rooms.json"), map: read("map.json")};
    });

  // Reject broken references before registering any partial world.
  let areaIds = new Set();
  for (let definition of definitions) {
    validate(definition, Room);
    if (areaIds.has(definition.area.id)) throw new Error(`Duplicate area id: ${definition.area.id}`);
    areaIds.add(definition.area.id);
  }
  if (!definitions.length) throw new Error("The world needs at least one area.");

  for (let definition of definitions) {
    let area = new Area(definition.area);
    area.folderName = definition.folderName;
    area.folderPath = definition.directory;
    area.largestRoomId = Math.max(area.largestRoomId || 0, ...definition.rooms.map((room) => room.id));
    area.register();

    for (let properties of definition.rooms) {
      let room = new Room(properties);
      room.register(area, properties.id);
    }

    for (let properties of definition.area.items || []) {
      let item = new Item(properties);
      item.register();
      area.items.set(properties.id, item);
    }

    for (let properties of definition.area.npcs || []) {
      let quest = properties.quest || {};
      let owner = new behaviours[properties.ai]({
        sword: area.items.get(quest.swordItemId),
        key: area.items.get(quest.keyItemId)
      });
      let npc = new Character({...properties, owner});
      npc.register();
      area.npcs.set(properties.id, npc);
    }

    for (let properties of definition.area.doors || []) {
      let key = area.items.get(properties.keyItemId);
      area.doors.set(properties.id, new Room.Door({...properties, keyId: key ? key.id : null}));
    }

    for (let properties of definition.map) {
      let cell = new Room.MapCell(properties);
      cell.register(area, properties.roomId);
      area.map.push(cell);
      for (let exit of properties.exits) {
        Room.link(cell.room, area.rooms.get(exit.destinationId), exit.direction,
          area.doors.get(exit.doorId), {oneway: exit.oneway});
      }
    }

    for (let properties of definition.area.npcs || []) {
      area.npcs.get(properties.id).move(area.rooms.get(properties.roomId));
    }
    for (let properties of definition.area.items || []) {
      let destination = properties.roomId != null
        ? area.rooms.get(properties.roomId) : area.npcs.get(properties.npcId).inventory;
      area.items.get(properties.id).move(destination);
    }
  }
};

function validate({area, rooms, map, directory}, Room) {
  let fail = (message) => { throw new Error(`${directory}: ${message}`); };
  if (!Array.isArray(rooms) || !Array.isArray(map)) fail("rooms and map must be arrays");
  let roomIds = ids(rooms, "room", fail);
  if (!roomIds.has(0)) fail("recall room 0 is missing");
  for (let room of rooms) if (!Number.isInteger(room.id) || room.id < 0) fail("room ids must be nonnegative integers");

  let npcIds = ids(area.npcs || [], "NPC", fail);
  let itemIds = ids(area.items || [], "item", fail);
  let doorIds = ids(area.doors || [], "door", fail);
  for (let npc of area.npcs || []) {
    if (!Object.hasOwn(behaviours, npc.ai)) fail(`unknown NPC behaviour: ${npc.ai}`);
    if (!roomIds.has(npc.roomId)) fail(`NPC ${npc.id} references missing room ${npc.roomId}`);
    if (npc.ai === "guard") {
      if (!npc.quest || !itemIds.has(npc.quest.swordItemId) || !itemIds.has(npc.quest.keyItemId)) {
        fail(`guard ${npc.id} needs valid sword and key item references`);
      }
    }
  }
  for (let item of area.items || []) {
    if ((item.roomId != null) === (item.npcId != null)) fail(`item ${item.id} needs exactly one spawn location`);
    if (item.roomId != null && !roomIds.has(item.roomId)) fail(`item ${item.id} references missing room ${item.roomId}`);
    if (item.npcId != null && !npcIds.has(item.npcId)) fail(`item ${item.id} references missing NPC ${item.npcId}`);
  }
  for (let door of area.doors || []) {
    if (door.keyItemId != null && !itemIds.has(door.keyItemId)) fail(`door ${door.id} references missing key ${door.keyItemId}`);
  }

  let mappedRooms = new Set();
  for (let cell of map) {
    if (!roomIds.has(cell.roomId)) fail(`map references missing room ${cell.roomId}`);
    if (mappedRooms.has(cell.roomId)) fail(`duplicate map cell for room ${cell.roomId}`);
    mappedRooms.add(cell.roomId);
    if (![cell.x, cell.y, cell.z].every(Number.isInteger)) fail(`invalid coordinates for room ${cell.roomId}`);
    if (!Array.isArray(cell.exits)) fail(`room ${cell.roomId} needs an exits array`);
    let directions = new Set();
    for (let exit of cell.exits) {
      if (!Room.directions.includes(exit.direction)) fail(`invalid exit direction in room ${cell.roomId}`);
      if (directions.has(exit.direction)) fail(`duplicate exit direction in room ${cell.roomId}`);
      directions.add(exit.direction);
      if (!roomIds.has(exit.destinationId)) fail(`exit references missing room ${exit.destinationId}`);
      if (exit.doorId != null && !doorIds.has(exit.doorId)) fail(`exit references missing door ${exit.doorId}`);
    }
  }
  for (let id of roomIds) if (!mappedRooms.has(id)) fail(`room ${id} is missing from the map`);
}

function ids(entries, type, fail) {
  if (!Array.isArray(entries)) fail(`${type} definitions must be an array`);
  let result = new Set();
  for (let entry of entries) {
    if (!entry || entry.id == null || result.has(entry.id)) fail(`missing or duplicate ${type} id`);
    result.add(entry.id);
  }
  return result;
}
