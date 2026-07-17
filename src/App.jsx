import AppRoutes from "./routes/AppRoutes"
import ToastProvider from "./components/ToastProvider"
import { AuthProvider } from "./context/AuthContext"

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  )
}
