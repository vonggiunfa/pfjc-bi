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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { format } from "date-fns"
import { BarChart, Calendar as CalendarIcon, ChevronDown, ChevronUp, Database, Download, Plus, Save, Trash2 } from "lucide-react"
import { KeyboardEvent, useEffect, useRef, useState } from "react"
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

// 生成mock数据的函数
const generateMockData = (daysCount = 30): ReportData[] => {
  const mockData: ReportData[] = [];
  
  // 设置一些真实的数据范围
  const wechatRange = { min: 2000, max: 5000 };
  const alipayRange = { min: 1500, max: 3500 };
  const cashRange = { min: 500, max: 1500 };
  const meituanRange = { min: 800, max: 2000 };
  const douyinRange = { min: 200, max: 1000 };
  const takeoutRange = { min: 1000, max: 3000 };
  
  const vegetableRange = { min: 800, max: 1500 };
  const frozenRange = { min: 500, max: 1200 };
  const dryRange = { min: 300, max: 800 };
  
  const peopleRange = { min: 30, max: 80 };
  
  // 根据周末和工作日调整销售额
  const getAdjustmentFactor = (date: Date): number => {
    const day = date.getDay();
    // 周五、周六、周日销售额更高
    if (day === 5 || day === 6 || day === 0) {
      return 1.3;
    }
    return 1.0;
  };
  
  // 生成随机金额字符串，考虑小数点
  const generateRandomAmount = (min: number, max: number, factor = 1): string => {
    const baseAmount = Math.random() * (max - min) + min;
    // 调整金额并保留两位小数
    return (baseAmount * factor).toFixed(2);
  };
  
  // 确保日期是递增的，从一个月前开始到昨天
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysCount);
  
  // 生成过去N天的数据
  for (let i = 0; i < daysCount; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const factor = getAdjustmentFactor(date);
    
    // 每周波动加入一些随机性，使数据更真实
    const weeklyVariation = 0.9 + (Math.random() * 0.3); // 0.9-1.2的随机变化
    
    // 随机销售数据
    const wechat = generateRandomAmount(wechatRange.min, wechatRange.max, factor * weeklyVariation);
    const alipay = generateRandomAmount(alipayRange.min, alipayRange.max, factor * weeklyVariation);
    const cash = generateRandomAmount(cashRange.min, cashRange.max, factor * weeklyVariation);
    const meituan = generateRandomAmount(meituanRange.min, meituanRange.max, factor * weeklyVariation);
    const douyin = generateRandomAmount(douyinRange.min, douyinRange.max, factor * weeklyVariation);
    const takeout = generateRandomAmount(takeoutRange.min, takeoutRange.max, factor * weeklyVariation);
    
    // 随机采购数据，采购数据随销售额有一定关联但不完全线性
    const totalIncome = parseFloat(wechat) + parseFloat(alipay) + parseFloat(cash) + 
                        parseFloat(meituan) + parseFloat(douyin) + parseFloat(takeout);
    
    // 采购占销售额的一定比例，但有随机浮动
    const purchaseFactor = 0.3 + (Math.random() * 0.1); // 30%-40%的采购成本比例
    const totalPurchase = totalIncome * purchaseFactor;
    
    // 随机分配总采购额到各类别
    const vegetablePct = 0.4 + (Math.random() * 0.2); // 40%-60%
    const frozenPct = 0.2 + (Math.random() * 0.2); // 20%-40%
    const dryPct = 1 - vegetablePct - frozenPct; // 剩余部分
    
    const vegetable = (totalPurchase * vegetablePct).toFixed(2);
    const frozen = (totalPurchase * frozenPct).toFixed(2);
    const dry = (totalPurchase * dryPct).toFixed(2);
    
    // 人数根据销售额估算，每人平均消费100-200元
    const avgConsumption = 100 + Math.random() * 100;
    const people = Math.max(10, Math.round(totalIncome / avgConsumption)).toString();
    
    mockData.push({
      id: generateId(),
      date,
      wechat,
      alipay,
      cash,
      meituan,
      douyin,
      takeout,
      total: '', // 这些会自动计算
      people,
      average: '',
      vegetable,
      frozen,
      dry,
      purchaseTotal: '',
      factTotal: ''
    });
  }
  
  return mockData;
};

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

  // 添加生成模拟数据的函数
  const handleGenerateMockData = () => {
    // 先确认是否要替换现有数据
    if (rows.length > 1 || (rows.length === 1 && (rows[0].total || rows[0].wechat))) {
      if (!window.confirm('这将替换当前所有数据，确定要继续吗？')) {
        return;
      }
    }
    
    // 生成30天的模拟数据
    const mockData = generateMockData(30);
    
    // 对每一行数据进行计算，确保派生字段有值
    const calculatedData = mockData.map(row => calculateRowValues(row));
    
    // 更新状态
    setRows(calculatedData);
    
    // 自动保存到本地存储
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(calculatedData));
    } catch (error) {
      console.error('保存模拟数据失败', error);
    }
    
    toast.success('已生成30天的模拟数据并保存');
    
    // 自动展开图表区域
    setIsChartsOpen(true);
  };

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
          ref={(el) => {
            inputRefs.current[`${row.id}_${column.dataIndex}`] = el
          }}
          value={value || ''}
          onChange={(value) => handleInputChange(row.id, column.dataIndex, value)}
          onBlur={() => calculateRow(row.id)}
          onKeyDown={(e) => handleKeyDown(e, row.id, colIndex)}
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
              onClick={handleGenerateMockData}
              className="h-8 bg-purple-100 hover:bg-purple-200 border-purple-300"
            >
              <Database className="mr-2 h-4 w-4" />
              生成模拟数据
            </Button>
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
            className="overflow-auto border rounded-md custom-scrollbar"
            style={{
              maxHeight: '50vh',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent',
              position: 'relative'
            }}
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
            `}</style>
            <Table>
              <TableHeader className="sticky top-0 bg-white z-20 shadow-sm after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border">
                <TableRow>
                  {columns.map(column => (
                    <TableHead 
                      key={column.key} 
                      className={`whitespace-nowrap text-center ${column.dataIndex === 'select' ? 'p-0' : ''} bg-white sticky top-0`}
                      style={{ 
                        width: column.width,
                        minWidth: column.minWidth
                      }}
                    >
                      {column.dataIndex === 'select' ? (
                        <div className="flex justify-center items-center w-full h-full p-2">
                          <Checkbox 
                            checked={selectAll} 
                            onCheckedChange={handleSelectAll}
                          />
                        </div>
                      ) : (
                        column.title
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow 
                    key={row.id}
                    className={selectedRows.has(row.id) ? 'bg-muted/50' : ''}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell 
                        key={`${row.id}_${column.key}`} 
                        className={`${column.dataIndex === 'select' ? 'p-0 w-10' : 'p-2'}`}
                      >
                        {getCellContent(row, column, rowIndex, colIndex)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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