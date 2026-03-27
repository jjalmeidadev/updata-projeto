import { BehaviorSubject } from "rxjs"

class AuthService {
  isAuthenticated$ = new BehaviorSubject<boolean>(false)

  loginWithRedirect = async () => undefined
}

export { AuthService }
