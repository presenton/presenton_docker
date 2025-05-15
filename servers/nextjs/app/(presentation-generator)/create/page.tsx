import React from 'react'
import CreatePage from './components/CreatePage'
import Header from '@/app/dashboard/components/Header'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Outline Presentation",
  description: "Customize and organize your presentation outline. Drag and drop slides, add charts, and generate your presentation with ease.",
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
  ]
}
const page = () => {
  return (
    <div className='relative min-h-screen'>
      <Header />
      <CreatePage />
    </div>
  )
}

export default page
