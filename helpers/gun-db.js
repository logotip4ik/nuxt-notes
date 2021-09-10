import Gun from 'gun/gun'
import 'gun/sea'
// import 'gun/lib/path'

const peers = []

if (process.env.NODE_ENV === 'production')
  peers.push('https://gun-notes.herokuapp.com/gun')
else peers.push('http://localhost:8765/gun')

export default Gun({
  peers,
  localStorage: true,
  radisk: false,
})
