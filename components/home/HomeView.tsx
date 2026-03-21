'use client'

import { useState, useEffect } from 'react'
import type { ServiceType } from '@/types/api'
import { useTelegram } from '@/components/providers/TelegramProvider'
import { HeroBanner } from './HeroBanner'
import { ServiceList } from './ServiceList'
import { ServiceDetail } from './ServiceDetail'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { getUserInfo } from '@/lib/api/services'

export function HomeView() {
  const { initData, isReady } = useTelegram()
  const [selected, setSelected] = useState<ServiceType | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)

  useEffect(() => {
    if (!isReady) return
    getUserInfo(initData).then(info => {
      if (info.isAdmin) setIsAdmin(true)
    }).catch(() => {})
  }, [isReady, initData])

  return (
    <>
      {selected ? (
        <ServiceDetail service={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
          <HeroBanner />
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
