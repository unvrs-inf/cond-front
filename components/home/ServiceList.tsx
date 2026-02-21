'use client';

import { useEffect, useState } from 'react';
import type { ServiceType } from '@/types/api';
import { getServiceTypes } from '@/lib/api/services';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ServiceCard } from './ServiceCard';

export function ServiceList() {
  const { initData } = useTelegram();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        setError(null);

        const response = await getServiceTypes(initData);
        setServices(response.content);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить услуги';
        setError(errorMessage);
        console.error('Failed to fetch services:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [initData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--tg-theme-hint-color)' }}>
          Услуги не найдены
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
