import { AES, enc } from 'crypto-js'
import { call } from '../../util/Api'
import Config from '../../config'

export const checkIfSavedCredentials = () => (dispatch) => {
  const item = localStorage.getItem('credentials')
  if (item) {
    dispatch({ type: 'credentials/gotSaved' })
  }
}

export const addCredentials = (key, secret, remember) => async (dispatch, getState) => {
  // Do a test request just to test the credentials
  const ret = await call('requests', { key, secret }, Config)

  if (ret.status === 403) {
    throw new Error('Bad credentials')
  } else {
    const payload = { key, secret }
    if (remember) {
      const encrypted = AES.encrypt(JSON.stringify(payload), remember)
      localStorage.setItem('credentials', encrypted)
    }
    dispatch({ type: 'credentials/add', payload })
  }
}

export const unlockSavedCredentials = (password) => async (dispatch) => {
  const encrypted = localStorage.getItem('credentials')
  try {
    const plain = AES.decrypt(encrypted, password).toString(enc.Utf8)
    const credentials = JSON.parse(plain)
    dispatch({ type: 'credentials/add', payload: credentials })
    return true
  } catch (e) {
    throw new Error('Bad password')
  }
}

export const clearSavedCredentials = () => (dispatch) => {
  localStorage.removeItem('credentials')
  dispatch({ type: 'credentials/clear' })
}
