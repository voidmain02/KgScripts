const path = require('path')
const test = require('ava')
const UserScript = require('./helpers/userscript.js').UserScript
const klavotools = require('../klavotools.json')

function getPathToUserJS(name) {
  return path.join(path.dirname('..'), 'scripts', name + '.user.js')
}

test('`version` & `name` properties in userjs\' directive and klavotools.json should be equal', async t => {
  t.plan(klavotools.length)

  for (const js of klavotools) {
    const path_script = getPathToUserJS(js.name)
    var script = await UserScript.Load(path_script)

    t.deepEqual({
      version: script.header.version,
      name: script.header.name
    }, {
      version: js.version,
      name: js.name
    })
  }
})
