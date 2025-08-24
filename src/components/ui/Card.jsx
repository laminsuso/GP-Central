import React from 'react'
export function Card({ className='', children }) { return <div className={`rounded-2xl border brand-border bg-white/90 backdrop-blur shadow-sm ${className}`}>{children}</div> }
export function CardBody({ className='', children }) { return <div className={`p-6 ${className}`}>{children}</div> }
