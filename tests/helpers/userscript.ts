import {promises as fs} from 'fs'

const META_START = '// ==UserScript=='
const META_END   = '// ==/UserScript=='

function str2re (str: string): RegExp {
  var regexp;
  if (str.startsWith('/') && str.endsWith('/')) {
    regexp = str.slice(1, -1)
  } else {
    regexp = str .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '\\?')
  }

  return new RegExp(regexp)
}

class MetaDirective {
  readonly key: string
  value: string

  constructor (key: string, value: string) {
    this.key = key
    this.value = value
  }

  toString (): string {
    return `// @${this.key} ${this.value}`
  }
}

class MetaHeader {
  props: Array<MetaDirective>
  readonly raw: string

  constructor (str: string) {
    this.raw = str
    this.props = this.raw.split(/\r?\n/g)
      .map(e => e.match(/^\s*\/\/\s+@([^\s]+)\s+(.+)$/))
      .filter(e => !!e)
      .map(e => new MetaDirective(e[1], e[2]))
  }

  isMatchUrl (url: string): boolean {
    return !!this.props
      .filter(p => p.key === 'include' || p.key === 'match')
      .map(p => str2re(p.value))
      .map(re => re.test(url))
      .find(p => p === true)
  }

  get (key: string): Array<string> {
    return this.props
      .filter(p => p.key === key)
      .map(p => p.value)
  }

  has (key: string): boolean {
    return !!this.props.find(p => p.key === key)
  }

  get version (): string {
    return this.get('version')[0]
  }

  get name (): string {
    return this.get('name')[0]
  }

  get description (): string {
    return this.get('description')[0]
  }

  toString (): string {
    return [META_START].concat(
      this.props.map(prop => prop.toString())
    ).concat(META_END).join('\r\n')
  }
}

export {
  UserScript, MetaHeader, MetaDirective
}

export default class UserScript {
  header: MetaHeader
  body: string

  constructor (code: string) {
    var start = code.indexOf(META_START)
    var end = code.indexOf(META_END)

    if (start === -1 || end === -1 || start > end)
      throw new Error('cannot get a userjs meta header')

    this.header = new MetaHeader(code.substring(start, end + META_END.length))
    this.body = code.substring(end + META_END.length);
  }

  get source (): string {
    return this.header.toString() + this.body
  }

  static async Load (path: string): Promise<UserScript> {
    const buf = await fs.readFile(path, {flag: 'r'})
    if (!buf)
      return Promise.reject('file not found')

    const code = buf.toString('utf8')
    return Promise.resolve(new UserScript (code))
  }
}
