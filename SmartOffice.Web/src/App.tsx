import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { authStore } from './stores/AuthStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'

const App = observer(() => {
  const [showRegister, setShowRegister] = useState(false)

  if (authStore.isAuthenticated) {
    return <DashboardPage />
  }

  if (showRegister) {
    return (
      <RegisterPage
        onShowLogin={() => setShowRegister(false)}
      />
    )
  }

  return (
    <LoginPage
      onShowRegister={() => setShowRegister(true)}
    />
  )
})

export default App