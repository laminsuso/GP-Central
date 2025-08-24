import React, { createContext, useContext, useState } from 'react'
const ThemeContext = createContext({ theme: 'ocean', setTheme: () => {} })
export const useTheme = () => useContext(ThemeContext)

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('ocean')
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme === 'forest' ? 'theme-forest' : ''}>{children}</div>
    </ThemeContext.Provider>
  )
}
