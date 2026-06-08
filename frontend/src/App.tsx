import { useAuth } from './hooks/useAuth'
import { AuthScreen } from './screens/AuthScreen'
import { HomeScreen } from './screens/HomeScreen'

function App() {
  const auth = useAuth()

  if (!auth.isAuthed) {
    return <AuthScreen auth={auth} />
  }

  return <HomeScreen onLogout={auth.logout} user={auth.user} />
}

export default App
