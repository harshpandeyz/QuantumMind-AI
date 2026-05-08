import { formatDistanceToNow } from 'date-fns'

export const cx = (...classes) => classes.filter(Boolean).join(' ')
export const timeAgo = (value) => value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : ''
export const prettyBytes = (bytes = 0) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`
}
