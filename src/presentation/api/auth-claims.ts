const claimNamespaces = [
  "https://updata.app",
  "https://api.updata.com",
]

export function readStringClaim(payload: Record<string, unknown>, key: string): string | undefined {
  const direct = payload[key]

  if (typeof direct === "string") {
    const normalized = direct.trim()
    return normalized.length > 0 ? normalized : undefined
  }

  for (const namespace of claimNamespaces) {
    const namespaced = payload[`${namespace}/${key}`]

    if (typeof namespaced === "string") {
      const normalized = namespaced.trim()
      return normalized.length > 0 ? normalized : undefined
    }
  }

  const suffix = `/${key}`

  for (const claimKey of Object.keys(payload)) {
    if (!claimKey.endsWith(suffix)) {
      continue
    }

    const namespaced = payload[claimKey]

    if (typeof namespaced === "string") {
      const normalized = namespaced.trim()
      if (normalized.length > 0) {
        return normalized
      }
    }
  }

  return undefined
}

export function resolveNameClaim(payload: Record<string, unknown>): string | undefined {
  const directName = readStringClaim(payload, "name")

  if (directName) {
    return directName
  }

  const givenName = readStringClaim(payload, "given_name")
  const familyName = readStringClaim(payload, "family_name")

  if (givenName && familyName) {
    return `${givenName} ${familyName}`.trim()
  }

  return givenName || familyName || readStringClaim(payload, "nickname") || readStringClaim(payload, "preferred_username")
}

export function resolveEmailClaim(payload: Record<string, unknown>): string | undefined {
  return readStringClaim(payload, "email") || readStringClaim(payload, "upn")
}