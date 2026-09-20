const path = require('node:path');
const {parseArgs} = require('node:util');

const root = path.resolve(__dirname, '../..');
const outputDirectory = path.join(root, 'artifacts/terminal-demo');

function selection(args = process.argv.slice(2)) {
  const {values} = parseArgs({args, options: {scenario: {type: 'string', default: 'all'}}});
  if (!['all', 'map', 'quest'].includes(values.scenario)) {
    throw new Error('--scenario must be all, map, or quest');
  }
  return values.scenario === 'all' ? ['map', 'quest'] : [values.scenario];
}

module.exports = {root, outputDirectory, selection};
