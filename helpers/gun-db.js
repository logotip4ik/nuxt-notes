import Gun from 'gun/gun'
import 'gun/sea'

export default Gun({
  peers: ['http://localhost:8765/gun'],
  localStorage: true,
  radisk: false,
})
