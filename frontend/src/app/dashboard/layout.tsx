import React from 'react'

const DashboardLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className='bg-gray-100 min-h-screen w-screen overflow-x-hidden'>
      {children}
    </div>
  )
}

export default DashboardLayout;