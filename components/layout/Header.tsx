'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'

export function Header() {
	const [copied, setCopied] = useState(false)
	const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	)

	return (
		<header className='fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 py-10'>
			<button
				className='flex items-center px-3 py-1.5 cursor-pointer'
				style={{ background: 'none', border: 'none', padding: 0 }}
				onClick={() => window.dispatchEvent(new Event('goHome'))}
				aria-label='На главную'
			>
				<Image
					src='/text-logo.svg'
					height={80}
					width={172}
					alt='Лого'
					style={{ filter: 'brightness(0) invert(1)' }}
				/>
			</button>
			<div
				className='flex flex-col items-start px-3 py-1.5 rounded-2xl'
				style={{
					background: 'rgba(10,20,60,0.50)',
					backdropFilter: 'blur(12px)',
					WebkitBackdropFilter: 'blur(12px)',
				}}
			>
				<a
					href='tel:+78000000000'
					className='text-sm font-normal text-yellow-400'
					onClick={e => {
						if (window.Telegram?.WebApp) {
							e.preventDefault()
							navigator.clipboard.writeText('+78000000000').then(() => {
								setCopied(true)
								clearTimeout(copiedTimerRef.current)
								copiedTimerRef.current = setTimeout(
									() => setCopied(false),
									2000,
								)
							})
						}
					}}
				>
					+7 (800) 000-00-00
				</a>
				{copied && (
					<span
						style={{
							color: 'rgba(255,255,255,0.80)',
							marginLeft: 3,
							fontSize: '0.65rem',
						}}
					>
						✓ Скопировано
					</span>
				)}
			</div>
		</header>
	)
}
