class UserEntity {

  user_id?: string
  user_name: string
  user_email: string
  auth0_id: string
  company_id?: number

  constructor(
    auth0_id: string,
    user_name: string,
    user_email: string,
    company_id?: number,
    user_id?: string
  ) {

    this.user_id = user_id
    this.user_name = user_name
    this.user_email = user_email
    this.auth0_id = auth0_id
    this.company_id = company_id

  }

  getEmailDomain(): string {

    // Empty email means no domain-based company match is possible.
    if (!this.user_email) {
      return ""
    }

    const parts = this.user_email.split("@")

    // Invalid email format; keep safe fallback.
    if (parts.length < 2) {
      return ""
    }

    return parts[1].toLowerCase()

  }

}

export { UserEntity }