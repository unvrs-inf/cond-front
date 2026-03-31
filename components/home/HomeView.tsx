'use client'

import { useState, useEffect } from 'react'
import type { ServiceType, InstallationDto } from '@/types/api'
import { useTelegram } from '@/components/providers/TelegramProvider'
import { HeroBanner } from './HeroBanner'
import { ServiceList } from './ServiceList'
import { ServiceDetail } from './ServiceDetail'
import { MyReservations } from './MyReservations'
import { InstallationView } from './InstallationView'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { getUserInfo, getInstallation } from '@/lib/api/services'

export function HomeView() {
  const { initData, isReady } = useTelegram()
  const [selected, setSelected] = useState<ServiceType | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [installation, setInstallation] = useState<InstallationDto | null>(null)
  const [installationOpen, setInstallationOpen] = useState(false)

  useEffect(() => {
    if (!isReady) return
    getUserInfo(initData).then(info => {
      if (info.isAdmin) setIsAdmin(true)
    }).catch(() => {})
    getInstallation(initData).then(data => setInstallation(data))
  }, [isReady, initData])

  useEffect(() => {
    const handler = () => {
      setSelected(null)
      setAdminOpen(false)
      setInstallationOpen(false)
    }
    window.addEventListener('goHome', handler)
    return () => window.removeEventListener('goHome', handler)
  }, [])

  return (
    <>
      {installationOpen && installation ? (
        <InstallationView
          installation={installation}
          initData={initData}
          onBack={() => setInstallationOpen(false)}
        />
      ) : selected ? (
        <ServiceDetail service={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
          <HeroBanner
            installation={installation}
            onInstallationClick={() => setInstallationOpen(true)}
          />
          <MyReservations />
          <section className='p-4'>
            <ServiceList onSelect={setSelected} />
          </section>
        </>
      )}
      {isAdmin && !adminOpen && <AdminButton onClick={() => setAdminOpen(true)} />}
      {isAdmin && adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </>
  )
}
