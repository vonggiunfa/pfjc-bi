'use client'

import ImageToPdf from '@/components/ImageToPdf'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ChevronRight, ImageIcon } from 'lucide-react'
import { useState } from 'react'

export default function FloatingTools() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleToolClick = () => {
    setIsExpanded(false)
    setIsDialogOpen(true)
  }

  return (
    <div className="fixed right-4 top-20 z-50">
      <div className="relative">
        {/* 主按钮 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center bg-primary text-primary-foreground rounded-lg shadow-lg transition-all duration-300',
            isExpanded ? 'pr-4' : 'w-10 h-10 justify-center'
          )}
        >
          <ChevronRight
            className={cn(
              'w-5 h-5 transition-transform duration-300',
              isExpanded ? 'rotate-90' : 'rotate-0'
            )}
          />
          {isExpanded && <span className="ml-2">工具箱</span>}
        </button>

        {/* 工具列表 */}
        <div
          className={cn(
            'absolute right-0 top-12 bg-white rounded-lg shadow-lg transition-all duration-300 overflow-hidden',
            isExpanded ? 'w-40 opacity-100' : 'w-0 opacity-0'
          )}
        >
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                onClick={handleToolClick}
                className="flex items-center w-full px-4 py-2 hover:bg-muted transition-colors"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                <span>图片转PDF</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <ImageToPdf />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
} 