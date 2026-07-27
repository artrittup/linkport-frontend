import AppRoutes from "./routes/AppRoutes"
import ToastProvider from "./components/ToastProvider"
import { AuthProvider } from "./context/AuthContext"
import { LocalContentProvider } from "./context/LocalContentContext"

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LocalContentProvider>
          <AppRoutes />
        </LocalContentProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
