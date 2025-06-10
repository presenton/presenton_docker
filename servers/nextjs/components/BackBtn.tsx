'use client';
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import React from 'react'
import { useRouter } from 'next/navigation';

const BackBtn = () => {
    const router = useRouter();
    return (
        <button onClick={() => router.back()} className='bg-blue-900 rounded-full p-2'>
            <ArrowLeftIcon className="w-5 h-5 text-white" />
        </button>
    )
}

export default BackBtn
