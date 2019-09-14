import sign from './Signing'
import Config from '../config'

export const call = (endpoint,  credentials) => {
  let url = Config.apiBaseUrl + endpoint
  const opts = {}

  const queryString = sign(url, opts, credentials)
  return fetch(url + queryString, opts)
}
