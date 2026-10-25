export function formRequest(parameters: object) {
  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== null) body.append(key, String(value))
  }
  return {
    data: body.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }
}
