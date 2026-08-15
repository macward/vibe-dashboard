import { Routes, Route } from 'react-router-dom'
import App from './App'
import { SettingsLayout } from '@/components/settings/SettingsLayout'
import { ProfilePage } from '@/pages/settings/ProfilePage'
import { NotificationsPage } from '@/pages/settings/NotificationsPage'
import { SecurityPage } from '@/pages/settings/SecurityPage'
import { WorkspacePage } from '@/pages/settings/WorkspacePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/settings" element={<SettingsLayout />}>
        <Route index element={<ProfilePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="workspace" element={<WorkspacePage />} />
      </Route>
    </Routes>
  )
}
