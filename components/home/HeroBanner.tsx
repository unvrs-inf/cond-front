'use client'

import Image from 'next/image'

export function HeroBanner() {
	return (
		<div className='w-full py-6 mt-60 px-6 flex flex-col items-center'>
			{/* Кружок вне карточки — наполовину вылезает за нижний край */}
			<div
				className='relative z-10 mb-[-48px] rounded-full w-24 h-24 flex items-center justify-center overflow-hidden flex-shrink-0'
				style={{
					background: 'rgba(0,0,0,0.7)',
					border: '2px solid rgba(255,255,255,0.2)',
				}}
			>
				<Image
					src='/text-logo.svg'
					width={80}
					height={80}
					alt='Лого'
					style={{ filter: 'invert(1)' }}
				/>
			</div>

			{/* Frosted glass карточка */}
			<div
				className='w-full rounded-4xl flex flex-col items-center pt-16 pb-8 px-6'
				style={{
					background: 'rgba(0, 0, 0, 0.45)',
					backdropFilter: 'blur(12px)',
					WebkitBackdropFilter: 'blur(12px)',
				}}
			>
				<h2 className='text-white font-medium text-xl text-center mb-2'>
					Обслуживание и установка кондиционеров
				</h2>
				<p className='text-yellow-400 text-xl font-med tracking-wide uppercase'>
					ОНЛАЙН БРОНИРОВАНИЕ
				</p>
			</div>
		</div>
	)
}
