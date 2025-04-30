'use client'

import ImageToPdf from '@/components/ImageToPdf'
import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogTitle,
  CustomDialogTrigger
} from '@/components/ui/custom-dialog'
import { cn } from '@/lib/utils'
import { ImageIcon, Settings2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function FloatingTools() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)

  const handleToolClick = () => {
    setIsExpanded(false)
    setIsDialogOpen(true)
  }

  // 处理点击外部区域关闭工具箱
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  return (
    <div className="fixed right-8 bottom-8 z-[10]" ref={toolsRef}>
      <div className="relative">
        {/* 工具列表 */}
        <div
          className={cn(
            'absolute right-0 bottom-16',
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
                ? 'translate-x-0 opacity-100 translate-y-0' 
                : 'translate-x-8 opacity-0 translate-y-4'
            )}
          >
            <CustomDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <CustomDialogTrigger asChild>
                <button
                  onClick={handleToolClick}
                  className={cn(
                    'flex items-center justify-center gap-2 w-full h-12',
                    'rounded-xl transition-colors duration-200',
                    'hover:bg-slate-50'
                  )}
                >
                  <ImageIcon className="w-5 h-5 text-black/80" />
                  <span className="text-sm font-medium text-black/80">
                    图片转PDF
                  </span>
                </button>
              </CustomDialogTrigger>
              <CustomDialogContent 
                className="max-w-3xl p-0 gap-0 rounded-xl shadow-2xl border-none overflow-hidden"
                title="图片转PDF"
                hideTitle={true}
              >
                <div className="flex items-center justify-between p-4 border-b bg-zinc-50">
                  <CustomDialogTitle className="text-base font-medium text-zinc-900">
                    图片转PDF
                  </CustomDialogTitle>
                  <button 
                    onClick={() => setIsDialogOpen(false)} 
                    className="text-zinc-500 hover:text-zinc-700 focus:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 bg-white">
                  <ImageToPdf />
                </div>
              </CustomDialogContent>
            </CustomDialog>
          </div>
        </div>

        {/* 主按钮 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'group flex items-center justify-center',
            'bg-gradient-to-br from-zinc-800/95 via-black to-zinc-900',
            'text-white transition-all duration-300',
            'hover:scale-105 active:scale-95',
            'rounded-2xl backdrop-blur-sm',
            'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)]',
            isExpanded 
              ? [
                'w-[120px] h-12 gap-2',
                'shadow-[0_16px_32px_-16px_rgba(0,0,0,0.3)]',
              ]
              : [
                'w-12 h-12 hover:rotate-12',
                'hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.25)]'
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
      </div>
    </div>
  )
} 