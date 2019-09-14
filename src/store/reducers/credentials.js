export default function credentials (state = false, action) {
  switch (action.type) {
    case 'credentials/add':
      return action.payload
    case 'credentials/gotSaved':
      return { saved: true }
    case 'credentials/clear':
      return false
    default:
      return state
  }
}
