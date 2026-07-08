'use client'

import { useAppStore } from '@/lib/store'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import DashboardView from '@/components/dashboard/DashboardView'
import AnalyticsView from '@/components/dashboard/analytics/AnalyticsView'
import KnowledgeView from '@/components/dashboard/knowledge/KnowledgeView'
import AppointmentsView from '@/components/dashboard/appointments/AppointmentsView'
import EmailsView from '@/components/dashboard/emails/EmailsView'
import CallsView from '@/components/dashboard/calls/CallsView'
import IntegrationsView from '@/components/dashboard/integrations/IntegrationsView'
import EmbedView from '@/components/dashboard/embed/EmbedView'
import ChatPreviewView from '@/components/dashboard/chat/ChatPreviewView'
import SettingsView from '@/components/dashboard/settings/SettingsView'

export default function Home() {
  const { activeNav } = useAppStore()

  const renderView = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardView />
      case 'analytics':
        return <AnalyticsView />
      case 'knowledge':
        return <KnowledgeView />
      case 'appointments':
        return <AppointmentsView />
      case 'emails':
        return <EmailsView />
      case 'calls':
        return <CallsView />
      case 'integrations':
        return <IntegrationsView />
      case 'embed':
        return <EmbedView />
      case 'chat':
        return <ChatPreviewView />
      case 'settings':
        return <SettingsView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {renderView()}
        </main>
      </div>
    </div>
  )
}