const step = (command, expect) => ({command, expect});
const prepareQuest = [
  step('language en', 'Language switched to English.'),
  step('north', 'Temple Courtyard'),
  step('west', 'Western Garden'),
  step('get sword', 'You take rusty sword.'),
  step('east', 'Temple Courtyard'),
  step('north', 'Temple Gate'),
  step('talk guard', '[2] I want to leave the temple.'),
  step('2', 'Bring it back to me, and the key is yours.')
];
const reward = step('give sword guard', 'Once opened, the passage is shared by all travellers.');

module.exports = {
  quest: {
    title: 'Shared guard quest', rows: 13, lineHeight: 1.2,
    filename: 'dialogue-demo.png',
    setup: prepareQuest,
    frame: [reward],
    visibleText: ['give sword guard', 'You give rusty sword to guard.', 'This key unlocks the northern gates.']
  },
  map: {
    title: 'Restored world', rows: 15, lineHeight: 1.3,
    filename: 'terminal-demo.png',
    setup: [
      ...prepareQuest, reward,
      step('open north', 'You open the temple gates.'),
      step('north', 'Woodland Edge'),
      step('north', 'Forest Trail'), step('west', 'Forest Trail'),
      step('north', 'Forest Trail'), step('north', 'Forest Trail'),
      step('east', 'Forest Trail'), step('east', 'Forest Trail'),
      step('east', 'Steep Riverbank'), step('south', 'Steep Riverbank'),
      step('south', 'Near A Bridge'), step('east', 'Bridge')
    ],
    frame: [step('look', 'With a boat, the river is open north and south.')],
    visibleText: ['look', 'Bridge', 'Old timbers creak above the flowing water.', 'Exits:']
  }
};
