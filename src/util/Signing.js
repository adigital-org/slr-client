// Some helpers derived from the docs
import { HmacSHA256, SHA256 } from 'crypto-js'

const getSignatureKey = (key, dateStamp, regionName, serviceName) => {
  const kDate = HmacSHA256(dateStamp, 'AWS4' + key)
  const kRegion = HmacSHA256(regionName, kDate)
  const kService = HmacSHA256(serviceName, kRegion)
  const kSigning = HmacSHA256('aws4_request', kService)
  return kSigning
}

/**
 * Prepares a request to Amazon API Gateway, signed with the given secret & key.
 * Takes the URL and options (as used with Fetch API), and either:
 * - Adds the signature to the headers, or
 * - Returns a query string to be added to the URL
 * For non-browser based implementations, the headers are recommended.
 * The GET params method is best suited for browsers, as it prevents needing to
 * perform a OPTIONS request before each call.
 */
const sign = (url, opts, { secret, key }, Config) => {
  // Get some bits from the URL and options
  const parsedUrl = new URL(url)

  const method = opts.method || (opts.body ? 'POST' : 'GET')

  // Create canonical req
  const dateStamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .substring(0, 15) + 'Z'
  const canonicalHeaders = `host:${parsedUrl.host}\n`
  const signedHeaders = "host"
  const payloadHash = SHA256(opts.body || '')

  const alg = 'AWS4-HMAC-SHA256'
  const amzDate = dateStamp.substring(0, 8)
  const credentialScope = [amzDate, Config.apiRegion, Config.apiService, 'aws4_request'].join('/')

  let canonicalQueryString = Config.apiAuthHeaders ? '' :
    'X-Amz-Algorithm=' + alg +
    '&X-Amz-Credential=' + encodeURIComponent(key + '/' + credentialScope) +
    '&X-Amz-Date=' + dateStamp +
    '&X-Amz-SignedHeaders=' + encodeURIComponent(signedHeaders)

  const canonicalRequest = [
    method, parsedUrl.pathname, canonicalQueryString,
    canonicalHeaders, signedHeaders,
    payloadHash
  ].join('\n')

  // Create signature
  const stringToSign = [
    alg, dateStamp, credentialScope, SHA256(canonicalRequest)
  ].join('\n')
  const signingKey = getSignatureKey(secret, amzDate, Config.apiRegion, Config.apiService)
  const signature = HmacSHA256(stringToSign, signingKey)


  if (Config.apiAuthHeaders) {
    // Add the headers
    if (!opts.headers) opts.headers = {}
    const authorizationHeader =
      `${alg} Credential=${key}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`

    opts.headers['Authorization'] = authorizationHeader
    opts.headers['X-Amz-Date'] = dateStamp

    // No query auth string needed
    return('')
  } else {
    // Add signature and return auth query string
    return('?' + canonicalQueryString + '&X-Amz-Signature=' + signature)
  }
}

export default sign
