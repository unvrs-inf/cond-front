'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'

const PHONES = [
	{ display: '+7 (951) 068-09-61', raw: '+79510680961' },
	{ display: '+7 (965) 594-59-99', raw: '+79655945999' },
]

export function Header() {
	const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
	const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	)

	function handleCopy(raw: string, idx: number) {
		navigator.clipboard.writeText(raw).then(() => {
			clearTimeout(copiedTimerRef.current)
			setCopiedIndex(idx)
			copiedTimerRef.current = setTimeout(() => setCopiedIndex(null), 2000)
		})
	}

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
				className='flex flex-col px-3 py-1.5 rounded-2xl'
				style={{
					background: 'rgba(10,20,60,0.50)',
					backdropFilter: 'blur(12px)',
					WebkitBackdropFilter: 'blur(12px)',
				}}
			>
				{PHONES.map((phone, idx) => (
					<div key={phone.raw}>
						{idx > 0 && (
							<div
								style={{
									borderTop: '1px solid rgba(255,255,255,0.10)',
									margin: '2px 0',
								}}
							/>
						)}
						<a
							href={`tel:${phone.raw}`}
							className='text-sm font-normal text-yellow-400 block'
							onClick={e => {
								if (window.Telegram?.WebApp) {
									e.preventDefault()
									handleCopy(phone.raw, idx)
								}
							}}
						>
							{phone.display}
						</a>
						{copiedIndex === idx && (
							<span
								style={{
									color: 'rgba(255,255,255,0.80)',
									fontSize: '0.65rem',
									display: 'block',
								}}
							>
								✓ Скопировано
							</span>
						)}
					</div>
				))}
			</div>
		</header>
	)
}
