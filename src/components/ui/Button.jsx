import React from 'react'
export default function Button({ as:Tag='button', variant='primary', className='', children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none brand-ring disabled:opacity-60 disabled:cursor-not-allowed'
  const styles = {
    primary: 'brand-bg hover:brand-bg-strong shadow-md',
    secondary: 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm',
    ghost: 'bg-transparent brand-text hover:bg-blue-50',
    dark: 'bg-gray-900 text-white hover:bg-black'
  }
  return <Tag className={`${base} ${styles[variant]||styles.primary} ${className}`} {...props}>{children}</Tag>
}
