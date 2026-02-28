'use client';

import type { ServiceType } from '@/types/api';

interface ServiceCardProps {
  service: ServiceType;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div
      className="p-4 rounded-lg border transition-transform hover:scale-[1.02]"
      style={{
        backgroundColor: 'var(--tg-theme-section-bg-color)',
        borderColor: 'var(--tg-theme-section-separator-color)',
      }}
    >
      <h3
        className="text-lg font-semibold mb-2"
        style={{
          color: 'var(--tg-theme-text-color)',
        }}
      >
        {service.serviceName}
      </h3>
      <p
        className="text-sm mb-3"
        style={{
          color: 'var(--tg-theme-subtitle-text-color)',
        }}
      >
        {service.serviceDescription}
      </p>
      <p
        className="text-lg font-bold"
        style={{
          color: 'var(--tg-theme-accent-text-color)',
        }}
      >
        {service.cost.toLocaleString('ru-RU')} ₽
      </p>
    </div>
  );
}
