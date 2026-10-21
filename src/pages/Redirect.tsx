import { Navigate, useLocation } from 'react-router-dom'

/** Sends an old URL to its new home, keeping the rest of the path, the query and the hash. */
export default function Redirect({ from, to }: { from: string; to: string }) {
  const { pathname, search, hash } = useLocation()
  const rest = pathname.startsWith(from) ? pathname.slice(from.length) : ''
  return <Navigate to={`${to}${rest}${search}${hash}`} replace />
}
