'use client'

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
    <div className="p-6">
      <div className="flex flex-col items-center gap-6">
        <div className="w-full max-w-xl">
          <label 
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">点击上传</span>
              </p>
              <p className="text-xs text-gray-500">支持 JPG、PNG 格式</p>
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
          <div className="w-full max-w-xl">
            <h3 className="font-medium mb-2">已选择的图片：</h3>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={convertToPdf}
          disabled={isConverting || selectedFiles.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConverting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>转换中...</span>
            </>
          ) : (
            <>
              <FileUp className="w-4 h-4" />
              <span>转换为PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
} 