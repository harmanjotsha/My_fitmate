export function errorHandler(error, _req, res, _next) {
  console.error(error)
  const status = error.status || 500
  const message = process.env.NODE_ENV === 'production' && status >= 500 ? 'Something went wrong' : error.message || 'Something went wrong'
  res.status(status).json({ message })
}
