import sign from './Signing'

export const call = (endpoint, credentials, Config, body, agent = null) => {
  let url = `${Config.apiProtocol}://${Config.apiDomain}${Config.apiBaseUrl}${endpoint}`
  const opts = body !== undefined ? {body, method: 'POST'} : {}

  const queryString = sign(url, opts, credentials, Config)
  // "agent" allows to some implementations to pass to fetch a http agent to,
  // for example, reuse HTTP connections using keep-alive header, improving
  // performance. It have to be be added after signing as is not part of the
  // sent request, just a node-fetch option.
  if (agent) opts.agent = agent
  return fetch(url + queryString, opts)
}
