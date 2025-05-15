import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const loading = () => {
    return (
        <div>
            <div className='grid grid-cols-4 gap-4  justify-center items-center h-screen'>
                {Array.from({ length: 10 }).map((_, index) => (
                    <Skeleton key={index} className="h-full   mx-auto" />
                ))}
            </div>
        </div>
    )
}

export default loading
