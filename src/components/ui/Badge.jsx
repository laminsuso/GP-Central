import React from 'react'
export default function Badge({ className='', children }) { return <span className={`inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium brand-text ${className}`}>{children}</span> }
