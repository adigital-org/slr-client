import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { Provider, intlReducer } from 'react-intl-redux'
import { addLocaleData } from 'react-intl'
import esLocaleData from 'react-intl/locale-data/es'
import thunk from 'redux-thunk'

import reducers from './store/reducers'
import locales from './locales'
import manuals from './locales/manual'
import legals from './locales/legal'
import desktops from './locales/desktop'
import Config from './config'
import App from './components/App'
import * as serviceWorker from './serviceWorker'
import './style/index.sass'

import nodeFile from './util/cli/File'
import nodeFileReader from './util/cli/FileReader'
if (window.electronFs) {
  window.File = nodeFile
  window.FileReader = nodeFileReader
}

// Determine lang to use
const browserLang = document.documentElement.lang ||
  window.navigator.language || window.navigator.userLanguage
const availableLangs = Object.keys(locales)
const locale =
  availableLangs.indexOf(browserLang) !== -1 ? browserLang : availableLangs[0]

// Add support for ES locale
addLocaleData(esLocaleData)

// Initial store state
const initialState = {
  intl: {
    locale,
    messages: locales[locale]
  }
}
initialState.intl.messages.markdown = {}
initialState.intl.messages.markdown.manual = manuals[locale]
initialState.intl.messages.markdown.legal = legals[locale]
initialState.intl.messages.markdown.desktop = desktops[locale]
Object.assign(initialState.intl.messages, Config.messages)

// Create the store
function configureStore() {
  return createStore(
    combineReducers({ ...reducers, intl: intlReducer }),
    initialState,
    applyMiddleware(thunk)
  )
}

// ...and start rendering!
ReactDOM.render(
  <Provider store={configureStore()}>
    <App />
  </Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
