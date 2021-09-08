import _gun from './gun-db'

export const gun = _gun
export const gunUser = _gun.user()

export const constants = {
  GUN_PREFIX: 'gun__',
  NOTE_PREFIX: 'note-',
}
