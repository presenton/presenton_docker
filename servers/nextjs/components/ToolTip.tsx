import { Tooltip } from '@radix-ui/react-tooltip'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import React from 'react'
import { TooltipContent, TooltipTrigger, } from './ui/tooltip'
import { Button } from './ui/button'

const ToolTip = ({ children, content }: { children: React.ReactNode, content: string }) => {
    return (
        <div>
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {children}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{content}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

export default ToolTip
