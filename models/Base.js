import { Data } from '../components/index.js'

let cacheMap = {}
let reFn = {}

export default class Base {
  constructor () {
    let proxy = new Proxy(this, {
      get (self, key, receiver) {
        if (key in self) {
          return Reflect.get(self, key, receiver)
        }
        if (self._get) {
          return self._get.call(receiver, key)
        }
        return (self._meta || self._data || self.meta || {})[key]
      }
    })
    return proxy
  }

  getData (arrList = '', cfg = {}) {
    arrList = arrList || this._dataKey || ''
    return Data.getData(this, arrList, cfg)
  }

  // 获取指定值数据，支持通过
  getVal (key, defaultValue) {
    return Data.getVal(this, key, defaultValue)
  }

  // 获取缓存
  _getCache (uuid = '', time = 10 * 60) {
    if (uuid && cacheMap[uuid]) {
      return cacheMap[uuid]._expire(time)
    }
    this._uuid = uuid
  }

  // 设置缓存
  _cache (time = 10 * 60) {
    let id = this._uuid
    if (id) {
      this._expire(time)
      cacheMap[id] = this
      return cacheMap[id]
    }
    return this
  }

  // 设置超时时间
  _expire (time = 10 * 60) {
    this._delCache()
    if (time > 0) {
      let id = this._uuid
      if (id) {
        reFn[id] = setTimeout(() => {
          reFn[id] && clearTimeout(reFn[id])
          delete reFn[id]
          delete cacheMap[id]
        }, time * 1000)
      }
      return cacheMap[id]
    } else {
      return this._delCache()
    }
  }

  // 删除缓存
  _delCache () {
    let id = this._uuid
    let ret = reFn[id] || false
    if (id) {
      reFn[id] && clearTimeout(reFn[id])
      delete reFn[id]
    }
    return ret
  }
}
