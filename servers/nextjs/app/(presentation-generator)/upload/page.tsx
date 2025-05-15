import React from 'react'

import UploadPage from './components/UploadPage'
import Header from '@/app/dashboard/components/Header'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Presenton | AI-Powered Presentation Generator & Design tool",
    description: "Transform your data into compelling presentations. Upload your documents and let our AI generate professional, data-driven presentations tailored to your needs.",
    alternates: {
        canonical: "https://presenton.ai/create"
    },
    keywords: [
        "presentation generator",
        "AI presentations",
        "data visualization",
        "automatic presentation maker",
        "professional slides",
        "data-driven presentations",
        "document to presentation",
        "presentation automation",
        "smart presentation tool",
        "business presentations"
    ],
    openGraph: {
        title: "Create Data Presentation | PresentOn",
        description: "Transform your data into compelling presentations with AI",
        type: "website",
        url: "https://presenton.ai/create",
        siteName: "PresentOn"
    },
    twitter: {
        card: "summary_large_image",
        title: "Create Data Presentation | PresentOn",
        description: "Transform your data into compelling presentations with AI",
        site: "@presenton_ai",
        creator: "@presenton_ai"
    }
}

const page = () => {

    return (
        <div className='relative'>

            <Header />
            <div className='flex flex-col items-center justify-center  py-4'>
                <h1 className='text-3xl font-semibold font-instrument_sans'>Create  Presentation </h1>
                {/* <p className='text-sm text-gray-500'>We will generate a presentation for you</p> */}
            </div>
            <UploadPage />
        </div>)

}
export default page

