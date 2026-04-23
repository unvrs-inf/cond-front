'use client'

import Image from 'next/image'

export function HeroBanner() {
	return (
		<div className='w-full py-6 mt-60 px-6 flex flex-col items-center'>
			{/* Кружок вне карточки — наполовину вылезает за нижний край */}
			<div
				className='relative z-10 mb-[-48px] rounded-full w-24 h-24 flex items-center justify-center overflow-hidden flex-shrink-0'
				style={{
					background: 'rgba(5,15,50,0.72)',
					border: '2px solid rgba(150,185,255,0.25)',
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
				className='w-full rounded-4xl flex flex-col items-center pt-16 pb-8 px-2'
				style={{
					background: 'rgba(5,15,50,0.55)',
					backdropFilter: 'blur(12px)',
					WebkitBackdropFilter: 'blur(12px)',
				}}
			>
				<a
					href='https://t.me/KlimatPro116'
					target='_blank'
					rel='noreferrer'
					className='mb-4 w-full max-w-xs py-3 rounded-2xl text-base font-medium text-center block'
					style={{ background: '#f5c518', color: '#1a1a1a' }}
				>
					Есть вопросы? Напишите нам!
				</a>
				<h2 className='text-white font-medium text-xl text-center mb-2'>
					Обслуживание кондиционеров
				</h2>
				<p className='text-yellow-400 text-xl font-med tracking-wide uppercase'>
					ОНЛАЙН БРОНИРОВАНИЕ
				</p>
			</div>
		</div>
	)
}
