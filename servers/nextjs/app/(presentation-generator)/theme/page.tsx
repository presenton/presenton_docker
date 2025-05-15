import React from 'react'
import ThemePage from './ThemePage'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Theme Selection | Presenton.ai",
    description: "Select a Presenton theme which will be suitable for your presentation",
}

const page = () => {
    return (
        <ThemePage />
    )
}

export default page
