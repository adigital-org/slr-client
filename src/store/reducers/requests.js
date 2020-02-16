export default function requests (state = false, action) {
  switch (action.type) {
    case 'session/start':
      return { working: true, originalFilename: action.payload.originalFilename }
    case 'session/progress':
      return { working: true, stats: { ...action.payload.stats }, originalFilename: state && state.originalFilename }
    case 'session/done':
      return { working: false, done: true, ...action.payload, originalFilename: state && state.originalFilename }
    case 'session/clear':
      return false
    default:
      return state
  }
}
