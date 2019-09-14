export default function requests (state = false, action) {
  switch (action.type) {
    case 'session/start':
      return { working: true, originalFilename: action.payload.originalFilename }
    case 'session/progress':
      return {
        working: true,
        originalFilename: state && state.originalFilename,
        stats: { ...action.payload }
      }
    case 'session/done':
      return {
        working: false,
        originalFilename: state && state.originalFilename,
        stats: state && state.stats,
        done: true,
        results: { ...action.payload }
      }
    case 'session/clear':
      return false
    default:
      return state
  }
}
