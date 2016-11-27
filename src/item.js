module.exports = class Item {
  constructor(name, color) {
    this.name = name;
    this.color = color;
    this.keywords = name.split(" ");
  }

  move(destination) {
    if (this.location) {
      this.location.items.splice(this.location.items.indexOf(this), 1);
    }

    destination.items.push(this);
    this.location = destination;
  }

  static place(itemsScope, roomsScope, itemName, roomName) {
    let item = itemsScope.find((item) => item.name == itemName);
    let room = roomsScope.find((room) => room.name == roomName);

    item.move(room);
  }
}
