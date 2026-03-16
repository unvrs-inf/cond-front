'use client';

import Image from 'next/image';
import type { ServiceType } from '@/types/api';

interface ServiceCardProps {
  service: ServiceType;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="rounded-3xl shadow-md overflow-hidden flex-shrink-0 w-40">
      <div className="relative h-28 w-full bg-slate-700">
        {service.imageUrl ? (
          <Image
            src={service.imageUrl.startsWith('http') ? service.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || ''}${service.imageUrl}`}
            alt={service.serviceName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-slate-400 text-3xl">❄️</span>
          </div>
        )}
      </div>
      <div className="p-2" style={{ backgroundColor: '#0EA5E9' }}>
        <p className="text-white font-bold text-xs uppercase leading-tight mb-1 line-clamp-2">
          {service.serviceName}
        </p>
        <p className="text-white font-semibold text-sm">
          {service.cost.toLocaleString('ru-RU')} ₽
        </p>
      </div>
    </div>
  );
}
