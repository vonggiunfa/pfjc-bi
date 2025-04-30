'use client'

import { cn } from '@/lib/utils'
import { FileUp, Loader2, Upload } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ImageToPdf() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isConverting, setIsConverting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const imageFiles = files.filter(file => 
      file.type.startsWith('image/jpeg') || 
      file.type.startsWith('image/png')
    )

    if (imageFiles.length === 0) {
      toast.error('请选择 JPG 或 PNG 格式的图片')
      return
    }

    setSelectedFiles(imageFiles)
  }

  const getPdfFileName = (file: File): string => {
    return file.name.replace(/\.(jpg|jpeg|png)$/i, '.pdf')
  }

  const convertToPdf = async () => {
    if (selectedFiles.length === 0) {
      toast.error('请先选择图片')
      return
    }

    setIsConverting(true)

    try {
      // 遍历每个文件，分别生成PDF
      for (const file of selectedFiles) {
        const pdfDoc = await PDFDocument.create()
        
        // 读取图片文件
        const imageBytes = await file.arrayBuffer()
        
        // 根据图片类型选择嵌入方法
        let image
        if (file.type === 'image/jpeg') {
          image = await pdfDoc.embedJpg(imageBytes)
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes)
        }

        if (!image) continue

        // 创建新页面并添加图片
        const page = pdfDoc.addPage([image.width, image.height])
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        })

        // 生成 PDF
        const pdfBytes = await pdfDoc.save()
        
        // 创建下载链接
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = getPdfFileName(file)
        link.click()
        
        // 清理当前URL
        URL.revokeObjectURL(url)
      }
      
      setSelectedFiles([])
      toast.success(`已完成 ${selectedFiles.length} 个PDF的转换！`)
    } catch (error) {
      console.error('转换失败:', error)
      toast.error('转换失败，请重试')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-5">
        <div className="w-full">
          <label 
            className={cn(
              "flex flex-col items-center justify-center",
              "w-full h-32 border border-dashed rounded-lg cursor-pointer",
              "bg-zinc-50 hover:bg-zinc-100 transition-colors duration-200",
              "border-zinc-300"
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-7 h-7 mb-2 text-zinc-500" />
              <p className="mb-1 text-sm text-zinc-700">
                <span className="font-medium">点击上传图片</span>
              </p>
              <p className="text-xs text-zinc-500">支持 JPG、PNG 格式</p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              disabled={isConverting}
            />
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-zinc-800">已选择图片</h3>
              <span className="text-xs text-zinc-500">{selectedFiles.length} 个文件</span>
            </div>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-zinc-200 divide-y">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center p-2.5 text-sm">
                  <div className="w-8 h-8 flex-shrink-0 bg-zinc-100 rounded-md flex items-center justify-center mr-2">
                    <FileUp className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-zinc-700">{file.name}</p>
                    <p className="text-xs text-zinc-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={convertToPdf}
            disabled={isConverting || selectedFiles.length === 0}
            className={cn(
              'inline-flex items-center justify-center gap-1.5',
              'h-8 px-3 text-xs font-medium',
              'bg-zinc-900 text-white rounded-md',
              'hover:bg-zinc-800 transition-colors',
              'disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            {isConverting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>转换中...</span>
              </>
            ) : (
              <>
                <FileUp className="w-3.5 h-3.5" />
                <span>转换为PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 