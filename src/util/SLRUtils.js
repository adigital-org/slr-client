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
/**
 * A key word for mixed input file
*/
export const mixedRecord = 'Mixed'

const defaultCountryCode = '0034'

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
export const normalizers = window.normalizers = {
  phone: (n) => {
    const normalized = n.replace(numberRegexp, '')
    if (n[0] === '+') return '00' + normalized
    if (n[0] === '0' && n[1] === '0') return normalized
    return defaultCountryCode + normalized
  },
  text: (n) => translate(textSrc, textDst, n).replace(textRegexp, ''),
  email: (n) => translate(emailSrc, emailDst, n).replace(emailRegexp, ''),
  portal: (n) => n === 'sn' ? 'sn' : n.match(portalRegexp).toString(),
  identity: (n) => translate(identitySrc, identityDst, n).replace(identityRegex, ''),
  preserve: (n) => n
}

/**
 * Check if the given record match the expected structure for
 * the given channel and perform minor fixes if needed.
 * On error, warn and return null.
 */
export const sanitize = (fields, channel) => {
  const malformed = (message) => {
    console.warn(message, fields)
    return null
  }

  // We do not want to modify fields input, so we have to create a copy...
  const sanFields = [...fields]

  // With mixed input, get record's channel and drop it from sanitized fields.
  const sanChannel = channel === mixedRecord ? sanFields.shift() : channel

  // Channel check
  if (!channels.hasOwnProperty(sanChannel))
    return malformed(`Unknown channel type "${sanChannel}" for record:`)

  const expectedFieldsLength = channels[sanChannel].fields.length

  // Reject records with wrong fields number (malformed records). Records from
  // mixed input files can have more fields than expected due to CSV spec.
  // For example:
  //    "PhoneFull","Name","Surname","Surname2","555444666"
  //    "PhoneSimple","555444666",,,
  // Drop (pop()) extra fields if empty and check if record length matches
  // channel spec.
  if (sanFields.length !== expectedFieldsLength) {
    if (channel !== mixedRecord) {
      // May contain custom field, if not, reject as malformed record.
      if (sanFields.length === expectedFieldsLength+1) sanFields.shift()
      else return malformed('Malformed record:')
    }
    else if (sanFields.length < expectedFieldsLength) return malformed('Malformed record:')
    else if (sanFields.length > expectedFieldsLength) {
      while (
        sanFields.length !== expectedFieldsLength &&
        sanFields[sanFields.length-1] === ''
        ) sanFields.pop()
      if (sanFields.length === expectedFieldsLength+1) sanFields.shift()
      else if (sanFields.length !== expectedFieldsLength) return malformed('Malformed record:')
    }
  }

  return { channel: sanChannel, fields: sanFields }
}

/**
 * Transforms a full record to a hash that can be sent to the SLR API.
 * Applies the normalizers to each field, and hashes the result as per the spec.
 * Expect as input a json with the record values: channel and fields.
 */
export const record2hash = (recordValues) => {
  const { channel, fields } = recordValues
  const { id, types } = channels[channel]
  // Process each field with the corresponding channel rules. Report if normalized record is empty
  const filtered = fields.map((val, i) => normalizers[types[i]](val)).join('')
  if (filtered.length === 0 || filtered === defaultCountryCode)
    console.warn(`Warning: empty record after normalization. Original: "${fields}". Normalized for channel ${channel}: "${filtered}".`)
  const query = id + filtered
  return SHA256(query).toString()
}

/**
 * Tries to guess the channel of a file by analyzing a record.
 * Uses the number of field, and the field contents, to inform its guess.
 * Note that it can guess wrong, or return undefined if no match.
 */
export const guessChannel = (fields) => {
  if (Object.keys(channels).indexOf(fields[0]) > -1) return mixedRecord
  const mFields = [...fields]
  if (mFields.length === 8 || mFields.length === 5 || mFields.length === 2) mFields.shift()
  if (mFields.length === 7) return 'Postal'
  if (mFields.length === 4) return 'PhoneFull' // or SmsFull
  if (mFields.length === 1) {
    if (mFields[0].indexOf('@') !== -1) return 'Email'
    if (mFields[0].match(/^([a-zA-Z][0-9]{7}|[0-9]{8})[a-zA-Z]$/)) return 'DNI_NIF_NIE'
    return 'PhoneSimple' // or SmsSimple
  }
}
