import React from 'react'
export default class DevErrorBoundary extends React.Component{
  constructor(p){ super(p); this.state = { error:null } }
  static getDerivedStateFromError(error){ return { error } }
  componentDidCatch(error, info){ console.error('⛔ Boundary caught:', error, info) }
  render(){
    if (this.state.error) return (
      <div className="p-6 max-w-2xl mx-auto text-red-700">
        <h2 className="text-xl font-bold">App crashed</h2>
        <pre className="mt-3 whitespace-pre-wrap">{String(this.state.error.stack || this.state.error)}</pre>
      </div>
    )
    return this.props.children
  }
}
