module.exports = class Item {
  constructor(name, color) {
    this.name = name;
    this.color = color;
  }

  static place(itemsScope, roomsScope, itemName, roomName) {
    let item = itemsScope.find((item) => item.name == itemName);
    let room = roomsScope.find((room) => room.name == roomName);

    room.items.push(item);
    item.location = room;
  }
}
