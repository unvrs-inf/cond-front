'use client'

import { useState } from 'react'
import type { ServiceType } from '@/types/api'
import { HeroBanner } from './HeroBanner'
import { ServiceList } from './ServiceList'
import { ServiceDetail } from './ServiceDetail'

export function HomeView() {
  const [selected, setSelected] = useState<ServiceType | null>(null)

  if (selected) {
    return <ServiceDetail service={selected} onBack={() => setSelected(null)} />
  }

  return (
    <>
      <HeroBanner />
      <section className='p-4'>
        <ServiceList onSelect={setSelected} />
      </section>
    </>
  )
}
