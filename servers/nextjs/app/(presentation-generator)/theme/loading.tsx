import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const loading = () => {
    return (
        <div className='h-screen'>
            <Skeleton className='h-24 w-full' />
            <div className='max-w-7xl mx-auto'>

                <Skeleton className='h-10 mt-10 w-60' />
                <div className='  mt-10  mx-auto grid grid-cols-2 gap-6'>
                    {
                        Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className='h-[210px] w-full' />
                        ))
                    }
                </div>
            </div>
        </div>

    )
}

export default loading