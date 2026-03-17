'use client'

import Image from 'next/image'

export function Header() {
	return (
		<header className='fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 py-10'>
			<div className='flex items-center px-3 py-1.5'>
				<Image
					src='/logo-2.svg'
					height={80}
					width={172}
					alt='Лого'
					style={{ filter: 'brightness(0) invert(1)' }}
				/>
			</div>
			<div
				className='flex items-center px-3 py-1.5 rounded-2xl'
				style={{
					background: 'rgba(0, 0, 0, 0.45)',
					backdropFilter: 'blur(12px)',
					WebkitBackdropFilter: 'blur(12px)',
				}}
			>
				<a
					href='tel:+78000000000'
					className='text-sm font-normal text-white'
				>
					+7 (800) 000-00-00
				</a>
			</div>
		</header>
	)
}
