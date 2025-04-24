"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, parse } from "date-fns"
import { BarChart, Calendar as CalendarIcon, ChevronDown, ChevronUp, Download, Plus, Save, Trash2, Upload } from "lucide-react"
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import MoneyInput, { divide, formatMoney, isNegativeValue, subtract, sum } from "./MoneyInput"
import SalesCharts from "./SalesCharts"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

// 定义本地存储key
const STORAGE_KEY = "sales-report-data"

// 定义数据类型
interface ReportData {
  id: string;
  date: Date;
  wechat: string;
  alipay: string;
  cash: string;
  meituan: string;
  douyin: string;
  takeout: string;
  total: string;
  people: string;
  average: string;
  vegetable: string;
  frozen: string;
  dry: string;
  purchaseTotal: string;
  factTotal: string;
}

// 定义表格列配置
const columns = [
  {
    title: '选择',
    dataIndex: 'select',
    key: 'select',
    isReadOnly: true,
    width: '40px',
    minWidth: '40px',
    isMoney: false,
  },
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
    isReadOnly: true,
    width: '150px',
    minWidth: '150px',
    isMoney: false,
  },
  {
    title: '微信',
    dataIndex: 'wechat',
    key: 'wechat',
    isReadOnly: false,
    width: '120px',
    minWidth: '100px',
    isMoney: true,
  },
  {
    title: '支付宝',
    dataIndex: 'alipay',
    key: 'alipay',
    isReadOnly: false,
    width: '120px',
    minWidth: '100px',
    isMoney: true,
  },
  {
    title: '现金',
    dataIndex: 'cash',
    key: 'cash',
    isReadOnly: false,
    width: '120px',
    minWidth: '100px',
    isMoney: true,
  },
  {
    title: '美团',
    dataIndex: 'meituan',
    key: 'meituan',
    isReadOnly: false,
    width: '120px',
    minWidth: '100px',
    isMoney: true,
  },
  {
    title: '抖音',
    dataIndex: 'douyin',
    key: 'douyin',
    isReadOnly: false,
    width: '120px',
    minWidth: '100px',
    isMoney: true,
  },
  {
    title: '外卖',
    dataIndex: 'takeout',
    key: 'takeout',
    isReadOnly: false,
    width: '120px',
    minWidth: '100px',
    isMoney: true,
  },
  {
    title: '总营业额',
    dataIndex: 'total',
    key: 'total',
    isReadOnly: true,
    width: '150px',
    minWidth: '150px',
    highlight: true,
    isMoney: true,
  },
  {
    title: '人数',
    dataIndex: 'people',
    key: 'people',
    isReadOnly: false,
    width: '100px',
    minWidth: '100px',
    isMoney: false,
  },
  {
    title: '人均',
    dataIndex: 'average',
    key: 'average',
    isReadOnly: true,
    width: '150px',
    minWidth: '150px',
    isMoney: true,
  },
  {
    title: '蔬菜',
    dataIndex: 'vegetable',
    key: 'vegetable',
    isReadOnly: false,
    width: '120px',
    minWidth: '100px',
    isMoney: true,
  },
  {
    title: '冻品',
    dataIndex: 'frozen',
    key: 'frozen',
    isReadOnly: false,
    width: '120px',
    minWidth: '100px',
    isMoney: true,
  },
  {
    title: '干货',
    dataIndex: 'dry',
    key: 'dry',
    isReadOnly: false,
    width: '120px',
    minWidth: '100px',
    isMoney: true,
  },
  {
    title: '采购总额',
    dataIndex: 'purchaseTotal',
    key: 'purchaseTotal',
    isReadOnly: true,
    width: '150px',
    minWidth: '150px',
    isMoney: true,
  },
  {
    title: '实收营业额',
    dataIndex: 'factTotal',
    key: 'factTotal',
    isReadOnly: true,
    width: '150px',
    minWidth: '150px',
    highlight: true,
    isMoney: true,
  }
]

// 生成唯一ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
}

// 创建初始数据行
const createInitialRow = (): ReportData => ({
  id: generateId(),
  date: new Date(),
  wechat: '',
  alipay: '',
  cash: '',
  meituan: '',
  douyin: '',
  takeout: '',
  total: '',
  people: '',
  average: '',
  vegetable: '',
  frozen: '',
  dry: '',
  purchaseTotal: '',
  factTotal: '',
})

// 数字输入框处理
const formatNumberInput = (value: string) => {
  if (!value) return ''
  // 移除非数字字符（保留小数点）
  const numericValue = value.replace(/[^\d.]/g, '')
  // 确保只有一个小数点
  const parts = numericValue.split('.')
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join('')}`
  }
  return numericValue
}

const SalesReportTable = () => {
  // 从本地存储加载数据
  const loadSavedData = (): ReportData[] => {
    if (typeof window === 'undefined') return [createInitialRow()]
    
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      
      // 检查是否有保存的数据
      if (!savedData) {
        return [createInitialRow()]
      }
      
      // 尝试解析数据
      let parsedData
      try {
        parsedData = JSON.parse(savedData)
      } catch (parseError) {
        console.error('JSON解析错误，重置数据', parseError)
        localStorage.removeItem(STORAGE_KEY)
        return [createInitialRow()]
      }
      
      // 确保解析出来的是数组
      if (!Array.isArray(parsedData)) {
        console.error('存储的数据不是数组，类型是:', typeof parsedData)
        
        // 尝试修复数据 - 如果是对象，尝试将其包装为数组
        if (typeof parsedData === 'object' && parsedData !== null) {
          try {
            const keys = Object.keys(parsedData)
            // 检查对象是否有ReportData的关键属性，如果有则可能是单个记录
            if (keys.includes('id') && keys.includes('date')) {
              const fixedData = [parsedData]
              // 保存修复后的数据
              localStorage.setItem(STORAGE_KEY, JSON.stringify(fixedData))
              console.info('成功修复单条数据为数组格式')
              
              // 确保返回正确格式的数据
              return fixedData.map(row => ({
                ...row,
                date: row.date ? new Date(row.date) : new Date()
              }))
            }
          } catch (fixError) {
            console.error('尝试修复数据失败', fixError)
          }
        }
        
        // 如果无法修复，则重置数据
        console.error('存储的数据不是数组且无法修复，重置数据')
        localStorage.removeItem(STORAGE_KEY)
        return [createInitialRow()]
      }
      
      // 确保数组不为空
      if (parsedData.length === 0) {
        return [createInitialRow()]
      }
      
      // 验证每个数据项
      const validData = parsedData.filter(item => {
        return item && typeof item === 'object' && 'id' in item && 'date' in item
      })
      
      // 如果所有数据都无效，则返回初始行
      if (validData.length === 0) {
        console.error('所有存储的数据都无效，重置数据')
        localStorage.removeItem(STORAGE_KEY)
        return [createInitialRow()]
      }
      
      // 转换日期并返回有效数据
      return validData.map(row => ({
        ...row,
        date: row.date ? new Date(row.date) : new Date()
      }))
    } catch (error) {
      // 捕获任何其他错误
      console.error('加载数据时发生错误', error)
      localStorage.removeItem(STORAGE_KEY)
      return [createInitialRow()]
    }
  }

  const [rows, setRows] = useState<ReportData[]>([createInitialRow()])
  const [isClient, setIsClient] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const inputRefs = useRef<{[key: string]: HTMLInputElement | null}>({})
  const [isChartsOpen, setIsChartsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // 处理表格滚动状态
  useEffect(() => {
    const handleScroll = () => {
      const container = tableContainerRef.current
      if (!container) return
      
      // 判断是否向右滚动（scrollLeft > 0）
      if (container.scrollLeft > 5) {
        container.classList.add('scrolled-right')
      } else {
        container.classList.remove('scrolled-right')
      }
    }
    
    const container = tableContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }
    
    // 清理事件监听
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isClient])

  // 处理输入变化
  const handleInputChange = (rowId: string, key: string, value: string) => {
    setRows(prevRows => {
      return prevRows.map(row => {
        if (row.id !== rowId) return row
        
        // 对于非金额字段，仍然使用简单的格式化
        if (key === 'people') {
          const formattedValue = formatNumberInput(value)
          return {
            ...row,
            [key]: formattedValue
          }
        }
        
        // 直接设置值（MoneyInput组件内部已经处理了格式化）
        return {
          ...row,
          [key]: value
        }
      })
    })
  }

  // 计算单行数据的派生值
  const calculateRowValues = (row: ReportData): ReportData => {
    // 计算总营业额 = 微信 + 支付宝 + 现金 + 美团 + 抖音 + 外卖
    const incomeValues = [row.wechat, row.alipay, row.cash, row.meituan, row.douyin, row.takeout]
    const total = sum(incomeValues)
    
    // 计算采购总额 = 蔬菜 + 冻品 + 干货
    const purchaseValues = [row.vegetable, row.frozen, row.dry]
    const purchaseTotal = sum(purchaseValues)
    
    // 计算人均
    const average = row.people && total ? 
      divide(total, row.people) : ''
    
    // 计算实收营业额 = 总营业额 - 采购总额
    const factTotal = total && purchaseTotal ? 
      subtract(total, purchaseTotal) : ''
    
    return {
      ...row,
      total,
      purchaseTotal,
      average,
      factTotal
    }
  }

  // 触发一行所有计算
  const calculateRow = (rowId: string) => {
    setRows(prevRows => {
      return prevRows.map(row => {
        if (row.id !== rowId) return row
        return calculateRowValues(row)
      })
    })
  }

  // 当日期变化时更新日期
  const handleDateChange = (rowId: string, date: Date | undefined) => {
    if (date) {
      setRows(prevRows => {
        return prevRows.map(row => {
          if (row.id !== rowId) return row
          return {
            ...row,
            date
          }
        })
      })
    }
  }

  // 处理键盘导航
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, rowId: string, currentIndex: number) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      
      // 获取下一个可编辑列的索引
      const editableColumns = columns
        .filter(col => !col.isReadOnly && col.dataIndex !== 'select')
        .map(col => col.dataIndex)
      
      const currentColumnIndex = editableColumns.findIndex(
        dataIndex => dataIndex === columns[currentIndex].dataIndex
      )
      
      const nextColumnIndex = (currentColumnIndex + 1) % editableColumns.length
      const nextColumn = editableColumns[nextColumnIndex]
      
      // 聚焦到下一个输入框
      inputRefs.current[`${rowId}_${nextColumn}`]?.focus()
    }
  }

  // 处理行选择
  const handleRowSelect = (rowId: string, checked: boolean) => {
    setSelectedRows(prev => {
      const newSelected = new Set(prev)
      if (checked) {
        newSelected.add(rowId)
      } else {
        newSelected.delete(rowId)
      }
      return newSelected
    })
  }

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      // 全选
      const allIds = rows.map(row => row.id)
      setSelectedRows(new Set(allIds))
    } else {
      // 取消全选
      setSelectedRows(new Set())
    }
  }

  // 添加新行
  const addRow = () => {
    setRows(prevRows => [...prevRows, createInitialRow()])
    
    // 延迟执行滚动操作，确保新行已渲染到DOM中
    setTimeout(() => {
      const tableContainer = document.querySelector('.table-container')
      if (tableContainer) {
        tableContainer.scrollTop = tableContainer.scrollHeight
      }
    }, 50)
  }

  // 删除选中行
  const deleteSelectedRows = () => {
    if (selectedRows.size === 0) {
      toast.error('请先选择要删除的行')
      return
    }

    if (rows.length <= selectedRows.size) {
      toast.error('至少保留一行数据')
      return
    }
    
    setRows(prevRows => prevRows.filter(row => !selectedRows.has(row.id)))
    setSelectedRows(new Set()) // 清空选择
    setSelectAll(false)
    toast.success(`已删除 ${selectedRows.size} 行数据`)
  }

  // 保存数据到本地存储
  const saveData = () => {
    try {
      // 确保数据是合法的数组结构后再保存
      if (!Array.isArray(rows) || rows.length === 0) {
        setRows([createInitialRow()])
        localStorage.setItem(STORAGE_KEY, JSON.stringify([createInitialRow()]))
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
      }
      toast.success('数据已保存')
    } catch (error) {
      console.error('Error saving data', error)
      toast.error('保存失败')
    }
  }

  // 导出CSV文件 - 选中行或全部
  const exportCSV = () => {
    try {
      // 获取要导出的行
      const rowsToExport = selectedRows.size > 0 
        ? rows.filter(row => selectedRows.has(row.id))
        : rows
        
      if (rowsToExport.length === 0) {
        toast.error('没有可导出的数据')
        return
      }
        
      // 表头行
      const headers = columns
        .filter(col => col.dataIndex !== 'select')
        .map(col => col.title)
        .join(',')
      
      // 数据行
      const dataRows = rowsToExport.map(row => {
        return columns
          .filter(col => col.dataIndex !== 'select')
          .map(col => {
            if (col.dataIndex === 'date') {
              return format(row.date, 'yyyy-MM-dd')
            }
            
            return row[col.dataIndex as keyof ReportData] || ''
          })
          .join(',')
      }).join('\n')
      
      // 创建CSV内容
      const csvContent = `${headers}\n${dataRows}`
      
      // 创建Blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      // 设置下载属性
      link.setAttribute('href', url)
      link.setAttribute('download', `销售数据_${format(new Date(), 'yyyy-MM-dd')}.csv`)
      
      // 隐藏链接并添加到DOM
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      
      // 触发下载
      link.click()
      
      // 清理
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(`成功导出 ${rowsToExport.length} 行数据`)
    } catch (error) {
      console.error('Error exporting data', error)
      toast.error('导出失败')
    }
  }

  // 处理CSV文件导入
  const handleImportCSV = () => {
    // 触发文件选择对话框
    fileInputRef.current?.click()
  }

  // 处理文件选择
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      toast.error('未选择文件')
      return
    }

    // 检查文件类型
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('请选择CSV格式的文件')
      event.target.value = '' // 重置input
      return
    }

    // 创建文件读取器
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string
        if (!csvContent) {
          toast.error('文件内容为空')
          return
        }
        
        // 解析CSV数据
        parseCSVData(csvContent)
      } catch (error) {
        console.error('导入文件时发生错误', error)
        toast.error('导入失败，文件格式错误')
      } finally {
        // 重置文件输入框
        event.target.value = ''
      }
    }
    
    reader.onerror = () => {
      toast.error('读取文件时发生错误')
      event.target.value = ''
    }
    
    // 读取文件内容
    reader.readAsText(file)
  }

  // 解析CSV数据并转换为表格数据
  const parseCSVData = (csvContent: string) => {
    try {
      // 分割为行
      const lines = csvContent.split('\n').filter(line => line.trim() !== '')
      
      if (lines.length < 2) {
        toast.error('CSV文件格式无效，至少需要表头和一行数据')
        return
      }
      
      // 获取表头行
      const headers = lines[0].split(',')
      
      // 验证CSV格式是否与表格格式匹配
      const expectedHeaders = columns
        .filter(col => col.dataIndex !== 'select')
        .map(col => col.title)
      
      // 检查必要的列是否存在
      const hasRequiredHeaders = expectedHeaders.every(header => 
        headers.includes(header)
      )
      
      if (!hasRequiredHeaders) {
        toast.error('CSV文件格式与表格不匹配，请使用导出功能导出的CSV文件')
        return
      }
      
      // 确认是否要替换现有数据
      if (rows.length > 1 || (rows.length === 1 && (rows[0].total || rows[0].wechat))) {
        if (!window.confirm('这将替换当前所有数据，确定要继续吗？')) {
          return
        }
      }
      
      // 解析数据行
      const newRows: ReportData[] = []
      
      // 从第二行开始解析数据
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        
        // 跳过空行或格式不正确的行
        if (values.length !== headers.length) continue
        
        // 创建新的数据行
        const newRow: any = createInitialRow()
        
        // 映射CSV数据到表格数据
        columns.forEach((column, idx) => {
          if (column.dataIndex === 'select') return
          
          const headerIndex = headers.findIndex(h => h === column.title)
          if (headerIndex === -1) return
          
          const value = values[headerIndex]
          
          // 特殊处理日期
          if (column.dataIndex === 'date') {
            try {
              // 支持多种日期格式
              let dateValue: Date | null = null
              if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                // YYYY-MM-DD 格式
                dateValue = parse(value, 'yyyy-MM-dd', new Date())
              } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
                // MM/DD/YYYY 格式
                dateValue = parse(value, 'MM/dd/yyyy', new Date())
              } else if (/^\d{4}\/\d{2}\/\d{2}$/.test(value)) {
                // YYYY/MM/DD 格式
                dateValue = parse(value, 'yyyy/MM/dd', new Date())
              }
              
              if (dateValue && !isNaN(dateValue.getTime())) {
                newRow.date = dateValue
              } else {
                newRow.date = new Date() // 默认为当前日期
              }
            } catch (dateError) {
              console.warn('日期解析错误', dateError)
              newRow.date = new Date() // 默认为当前日期
            }
          } else {
            // 处理其他列的数据
            newRow[column.dataIndex] = value || ''
          }
        })
        
        // 添加到新行数组
        newRows.push(newRow)
      }
      
      if (newRows.length === 0) {
        toast.error('未找到有效数据行')
        return
      }
      
      // 对每一行数据进行计算，确保派生字段有值
      const calculatedData = newRows.map(row => calculateRowValues(row))
      
      // 更新状态
      setRows(calculatedData)
      
      // 保存到本地存储
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(calculatedData))
        toast.success(`成功导入 ${calculatedData.length} 行数据`)
      } catch (saveError) {
        console.error('保存导入数据失败', saveError)
        toast.warning('数据导入成功，但保存到本地存储失败')
      }
    } catch (error) {
      console.error('解析CSV数据时发生错误', error)
      toast.error('解析CSV文件失败')
    }
  }

  // 当组件挂载时加载数据并执行一次计算
  useEffect(() => {
    setIsClient(true)
    const savedData = loadSavedData()
    setRows(savedData)
  }, [])
  
  // 当数据变化时自动计算每一行
  useEffect(() => {
    if (isClient) {
      setRows(prevRows => {
        return prevRows.map(row => calculateRowValues(row))
      })
    }
  }, [isClient])

  // 当行数据变化时，更新全选状态
  useEffect(() => {
    if (rows.length > 0 && selectedRows.size === rows.length) {
      setSelectAll(true)
    } else {
      setSelectAll(false)
    }
  }, [selectedRows, rows])

  // 获取单元格内容
  const getCellContent = (row: ReportData, column: typeof columns[0], rowIndex: number, colIndex: number) => {
    // 选择列 - 多选框
    if (column.dataIndex === 'select') {
      return (
        <div className="flex justify-center items-center w-full h-full">
          <Checkbox 
            checked={selectedRows.has(row.id)} 
            onCheckedChange={(checked) => handleRowSelect(row.id, checked === true)}
          />
        </div>
      )
    }
    
    // 日期列 - 日期选择器
    if (column.dataIndex === 'date') {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {row.date ? format(row.date, 'yyyy-MM-dd') : '选择日期'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={row.date}
              onSelect={(date) => handleDateChange(row.id, date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )
    }
    
    // 只读列 - 显示值
    if (column.isReadOnly) {
      const value = row[column.dataIndex as keyof ReportData] as string
      const isNegative = column.isMoney && isNegativeValue(value)
      const displayValue = column.isMoney && value ? formatMoney(value) : value
      
      const negativeStyling = isNegative 
        ? 'bg-red-100 border-red-300 text-red-700 font-semibold shadow-sm shadow-red-200' 
        : ''
      
      return (
        <div className={`h-10 px-3 py-2 flex items-center justify-center rounded-md border border-input 
          ${column.highlight ? 'bg-primary/10 font-medium' : 'bg-muted'} 
          ${negativeStyling}`}>
          {displayValue || ''}
        </div>
      )
    }
    
    // 可编辑金额列 - MoneyInput
    if (column.isMoney) {
      const value = row[column.dataIndex as keyof ReportData] as string
      const isNegative = isNegativeValue(value)
      
      return (
        <MoneyInput
          ref={(el: HTMLInputElement | null) => {
            inputRefs.current[`${row.id}_${column.dataIndex}`] = el
          }}
          value={value || ''}
          onChange={(value: string) => handleInputChange(row.id, column.dataIndex, value)}
          onBlur={() => calculateRow(row.id)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, row.id, colIndex)}
          placeholder="请输入"
          isNegative={isNegative}
        />
      )
    }
    
    // 其他可编辑列 - 普通Input
    return (
      <Input
        ref={(el) => {
          inputRefs.current[`${row.id}_${column.dataIndex}`] = el
        }}
        value={row[column.dataIndex as keyof ReportData] as string || ''}
        onChange={(e) => handleInputChange(row.id, column.dataIndex, e.target.value)}
        onBlur={() => calculateRow(row.id)}
        onKeyDown={(e) => handleKeyDown(e, row.id, colIndex)}
        placeholder="请输入"
        className="text-center"
      />
    )
  }

  if (!isClient) return null

  const selectedCount = selectedRows.size;
  const totalCount = rows.length;
  const hasSelected = selectedCount > 0;

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addRow}
              className="h-8"
            >
              <Plus className="mr-2 h-4 w-4" />
              新增
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={deleteSelectedRows}
              className="h-8"
              disabled={!hasSelected}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除{hasSelected ? `(${selectedCount})` : ''}
            </Button>
            <span className="text-sm text-muted-foreground ml-2">
              {hasSelected ? `已选择 ${selectedCount}/${totalCount} 行` : ''}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleImportCSV}
              className="h-8 bg-blue-100 hover:bg-blue-200 border-blue-300"
            >
              <Upload className="mr-2 h-4 w-4" />
              导入CSV
            </Button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              className="hidden"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportCSV}
              className="h-8"
            >
              <Download className="mr-2 h-4 w-4" />
              {hasSelected ? '导出所选' : '导出全部'}
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={saveData}
              className="h-8"
            >
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="w-full relative" style={{ minWidth: "100%" }}>
          <div 
            className="overflow-auto border rounded-md custom-scrollbar table-container"
            style={{
              maxHeight: '50vh',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent',
              position: 'relative'
            }}
            ref={tableContainerRef}
          >
            <style jsx global>{`
              /* 自定义滚动条样式 */
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(240, 240, 240, 0.5);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: rgba(156, 163, 175, 0.5);
                border-radius: 10px;
                border: 2px solid transparent;
                background-clip: content-box;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: rgba(156, 163, 175, 0.8);
              }
              
              /* 修改实现方式：直接使用原生表格样式 */
              .sticky-table {
                border-collapse: separate;
                border-spacing: 0;
                width: 100%;
                table-layout: fixed;
              }
              
              /* 固定表头 */
              .sticky-table thead th {
                position: sticky;
                top: 0;
                z-index: 10;
                background-color: white;
                box-shadow: inset 0 -1px 0 #e5e7eb;
                font-weight: 500;
                text-align: center;
                color: #6b7280;
                padding: 0.75rem;
                font-size: 0.875rem;
                line-height: 1.25rem;
              }
              
              /* 固定左侧列 */
              .sticky-table th.sticky-left,
              .sticky-table td.sticky-left {
                position: sticky;
                left: 0;
                z-index: 5;
                background-color: white;
                /* 移除勾选列的阴影 */
              }
              
              /* 第二个固定列 (日期列) */
              .sticky-table th.sticky-left-2,
              .sticky-table td.sticky-left-2 {
                position: sticky;
                left: 40px; /* 第一列的宽度 */
                z-index: 4;
                background-color: white;
              }
              
              /* 添加滚动感知的阴影效果 */
              .table-container.scrolled-right .sticky-table th.sticky-left-2,
              .table-container.scrolled-right .sticky-table td.sticky-left-2 {
                box-shadow: 2px 0 5px rgba(0, 0, 0, 0.07);
              }
              
              /* 修复表头日期列下边框问题 - 确保日期列表头下边框在滚动时始终可见 */
              .sticky-table thead th.sticky-left-2 {
                box-shadow: inset 0 -1px 0 #e5e7eb;
              }
              
              /* 滚动状态下，保持表头下边框的同时添加右侧阴影 */
              .table-container.scrolled-right .sticky-table thead th.sticky-left-2 {
                box-shadow: 2px 0 5px rgba(0, 0, 0, 0.07), inset 0 -1px 0 #e5e7eb;
              }
              
              /* 固定列与固定表头的交叉部分，需要更高的z-index */
              .sticky-table thead th.sticky-left {
                z-index: 15;
              }
              
              .sticky-table thead th.sticky-left-2 {
                z-index: 14;
              }
              
              /* 表格行边框 */
              .sticky-table tbody tr {
                border-bottom: 1px solid #e5e7eb;
                position: relative;
              }
              
              .sticky-table tbody tr:last-child {
                border-bottom: none;
              }
              
              .sticky-table tbody tr.selected {
                background-color: rgba(0, 0, 0, 0.05);
              }
              
              /* 当选中行时，依然保持固定列的白色背景（非滚动状态） */
              .sticky-table tbody tr.selected td.sticky-left,
              .sticky-table tbody tr.selected td.sticky-left-2 {
                background-color: rgba(0, 0, 0, 0.05);
              }
              
              /* 确保选中行且滚动时的样式正确 */
              .table-container.scrolled-right .sticky-table tbody tr.selected td.sticky-left-2 {
                background-color: rgba(0, 0, 0, 0.05);
                box-shadow: 2px 0 5px rgba(0, 0, 0, 0.07);
              }
              
              .sticky-table td {
                padding: 0.5rem;
              }
            `}</style>
            
            {/* 使用原生表格替代shadcn的Table组件 */}
            <table className="sticky-table">
              <thead>
                <tr>
                  {columns.map((column, colIndex) => (
                    <th 
                      key={column.key}
                      className={
                        colIndex === 0 ? 'sticky-left' : 
                        colIndex === 1 ? 'sticky-left-2' : ''
                      }
                      style={{ 
                        width: column.width,
                        minWidth: column.minWidth,
                      }}
                    >
                      {column.dataIndex === 'select' ? (
                        <div className="flex justify-center items-center w-full h-full">
                          <Checkbox 
                            checked={selectAll} 
                            onCheckedChange={handleSelectAll}
                          />
                        </div>
                      ) : (
                        column.title
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr 
                    key={row.id}
                    className={selectedRows.has(row.id) ? 'selected' : ''}
                  >
                    {columns.map((column, colIndex) => (
                      <td 
                        key={`${row.id}_${column.key}`}
                        className={`
                          ${column.dataIndex === 'select' ? 'w-10 p-0' : ''}
                          ${colIndex === 0 ? 'sticky-left' : ''}
                          ${colIndex === 1 ? 'sticky-left-2' : ''}
                        `}
                      >
                        {getCellContent(row, column, rowIndex, colIndex)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>

      <div className="px-4 pt-2 pb-4">
        <Collapsible
          open={isChartsOpen}
          onOpenChange={setIsChartsOpen}
          className="w-full border rounded-md"
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center justify-between w-full p-4">
              <div className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                <span className="font-medium">数据分析图表</span>
              </div>
              {isChartsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4">
            <SalesCharts rows={rows} />
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
        <div>数据自动保存在本地浏览器中，如需长期保存请点击"保存"按钮。实收营业额为负数时会显示红色背景。</div>
      </CardFooter>
    </Card>
  )
}

export default SalesReportTable