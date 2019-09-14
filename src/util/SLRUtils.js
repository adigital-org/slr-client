import { SHA256 } from 'crypto-js'

/**
 * A catalog of all available channels, with their id, fields, types, etc.
 * This list is used to pick the available channels for a given file type
 * (see ChannelPicker), and to find out which normalizers must be applied
 * to each field depending on the channel.
 */
export const channels = {
  'PhoneSimple': {
    id: '04',
    fields: ['phone'],
    types: ['phone'],
    fileType: 'Phones',
    campaign: 'Calls'
  },
  'SmsSimple': {
    id: '03',
    fields: ['phone'],
    types: ['phone'],
    fileType: 'Phones',
    campaign: 'Sms'
  },
  'PhoneFull': {
    id: '04',
    fields: ['name', 'surname1', 'surname2', 'phone'],
    types: ['text', 'text', 'text', 'phone'],
    fileType: 'NameAndPhones',
    campaign: 'Calls'
  },
  'SmsFull': {
    id: '03',
    fields: ['name', 'surname1', 'surname2', 'phone'],
    types: ['text', 'text', 'text', 'phone'],
    fileType: 'NameAndPhones',
    campaign: 'Sms'
  },
  'Postal': {
    id: '01',
    fields: [
      'name', 'surname1', 'surname2',
      'street', 'portal', 'zip', 'province'
    ],
    types: [
      'text', 'text', 'text',
      'text', 'portal', 'preserve', 'preserve'
    ],
    fileType: 'Postal',
    campaign: 'Postal'
  },
  'Email': {
    id: '02',
    fields: ['email'],
    types: ['email'],
    fileType: 'Email',
    campaign: 'Email'
  },
  'DNI_NIF_NIE': {
    id: '00',
    fields: ['dni'],
    types: ['identity'],
    fileType: 'DNI_NIF_NIE',
    campaign: 'DNI_NIF_NIE'
  }
}


const textSrc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÇÈÉÌÍÑÒÓÙÚÜàáçèéìíñòóùúü'.split('')
const textDst = 'abcdefghijklmnopqrstuvwxyzaaceeiinoouuuaaceeiinoouuu'.split('')
const emailSrc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const emailDst = 'abcdefghijklmnopqrstuvwxyz'.split('')
const textRegexp = /[^a-z]/g
const emailRegexp = /[^a-z0-9.@_\-+]/g
const numberRegexp = /[^0-9]/g
const portalRegexp = /[0-9]*/
const identitySrc = '0123456789ABCDEFGHJKLMNPQRSTVWXYZ'.split('')
const identityDst = '0123456789abcdefghjklmnpqrstvwxyz'.split('')
const identityRegex = /[^0-9abcdefghjklmnpqrstvwxyz]/g
const translate = (src, dst, value) => value.split('').map((c) => {
  const idx = src.indexOf(c)
  return idx !== -1 ? dst[idx] : c
}).join('')

/**
 * The collection of normalization functions, keyed by field type.
 * Each field type has a corresponding function which takes a value,
 * and returns the value normalized according to the service rules.
 */
const normalizers = window.normalizers = {
  phone: (n) => {
    const normalized = n.replace(numberRegexp, '')
    if (n[0] === '+') return '00' + normalized
    if (n[0] === '0' && n[1] === '0') return normalized
    return '0034' + normalized
  },
  text: (n) => translate(textSrc, textDst, n).replace(textRegexp, ''),
  email: (n) => translate(emailSrc, emailDst, n).replace(emailRegexp, ''),
  portal: (n) => n === 'sn' ? 'sn' : n.match(portalRegexp).toString(),
  identity: (n) => translate(identitySrc, identityDst, n).replace(identityRegex, ''),
  preserve: (n) => n
}

/**
 * Transforms a full record to a hash that can be sent to the SLR API.
 * Applies the normalizers to each field, and hashes the result as per the spec.
 */
export const record2hash = (fields, channel) => {
  const { id, types } = channels[channel]
  if (fields.length !== types.length) {
    console.warn('Malformed record:', fields)
    return null
  }
  // Process each field with the corresponding channel rules
  const filtered = fields.map((val, i) => normalizers[types[i]](val))
  const query = id + filtered.join('')
  return SHA256(query).toString()
}

/**
 * Tries to guess the channel of a file by analyzing a record.
 * Uses the number of field, and the field contents, to inform its guess.
 * Note that it can guess wrong, or return undefined if no match.
 */
export const guessChannel = (fields) => {
  if (fields.length === 7) return 'Postal'
  if (fields.length === 4) return 'PhoneFull' // or SmsFull
  if (fields.length === 1) {
    if (fields[0].indexOf('@') !== -1) return 'Email'
    if (fields[0].match(/^([a-zA-Z][0-9]{7}|[0-9]{8})[a-zA-Z]$/)) return 'DNI_NIF_NIE'
    return 'PhoneSimple' // or SmsSimple
  }
}
