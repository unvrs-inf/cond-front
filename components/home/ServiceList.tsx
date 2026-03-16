'use client';

import { useEffect, useState } from 'react';
import type { ServiceType } from '@/types/api';
import { getServiceTypes } from '@/lib/api/services';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ServiceCard } from './ServiceCard';

export function ServiceList() {
  const { initData, isReady } = useTelegram();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    async function fetchServices() {
      try {
        setLoading(true);
        setError(null);

        const response = await getServiceTypes(initData);
        setServices(response.content);
      } catch (err) {
        const errorMessage = (err as { message?: string }).message || 'Не удалось загрузить услуги';
        setError(errorMessage);
        console.error('Failed to fetch services:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [isReady, initData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">
          Услуги не найдены
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
