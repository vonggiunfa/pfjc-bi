'use client'

import ImageToPdf from '@/components/ImageToPdf'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ImageIcon, Settings2 } from 'lucide-react'
import { useState } from 'react'

export default function FloatingTools() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleToolClick = () => {
    setIsExpanded(false)
    setIsDialogOpen(true)
  }

  return (
    <div className="fixed right-8 top-20 z-[100]">
      <div className="relative">
        {/* 主按钮 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'group flex items-center justify-center',
            'bg-gradient-to-br from-primary/90 via-primary to-primary/95',
            'text-primary-foreground transition-all duration-300',
            'hover:scale-105 active:scale-95',
            'rounded-2xl backdrop-blur-sm',
            'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]',
            isExpanded 
              ? [
                'w-[120px] h-12 gap-2',
                'shadow-[0_16px_32px_-16px_rgba(0,0,0,0.2)]',
              ]
              : [
                'w-12 h-12 hover:rotate-12',
                'hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.15)]'
              ]
          )}
        >
          <Settings2 
            className={cn(
              'w-5 h-5 transition-transform duration-300',
              isExpanded && 'rotate-180'
            )}
          />
          <span className={cn(
            'text-sm font-medium transition-all duration-300',
            'absolute transform',
            isExpanded 
              ? 'opacity-100 translate-x-0 relative' 
              : 'opacity-0 translate-x-4 absolute'
          )}>
            工具箱
          </span>
        </button>

        {/* 工具列表 */}
        <div
          className={cn(
            'absolute right-0 top-16',
            'overflow-hidden',
            isExpanded ? 'w-[120px]' : 'w-0'
          )}
        >
          <div 
            className={cn(
              'bg-white rounded-2xl',
              'border border-slate-200/30',
              'p-1 transition-all duration-300 transform',
              isExpanded 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-8 opacity-0'
            )}
          >
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={handleToolClick}
                  className={cn(
                    'flex items-center justify-center gap-2 w-full h-12',
                    'rounded-xl transition-colors duration-200',
                    'hover:bg-slate-50'
                  )}
                >
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-slate-600">
                    图片转PDF
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <ImageToPdf />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
} 