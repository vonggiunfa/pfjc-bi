"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import * as React from "react"

import { cn } from "@/lib/utils"

// 重用原始 Dialog 组件
export const CustomDialog = DialogPrimitive.Root
export const CustomDialogTrigger = DialogPrimitive.Trigger
export const CustomDialogClose = DialogPrimitive.Close

// 添加自定义 DialogTitle 和相关组件以解决可访问性问题
export const CustomDialogTitle = DialogPrimitive.Title
export const CustomDialogDescription = DialogPrimitive.Description

// 可视隐藏组件，用于隐藏内容但保持屏幕阅读器可访问性
export const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
)

// 创建自定义 DialogContent，不包含默认关闭按钮
export const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideTitle?: boolean;
    title?: string;
  }
>(({ className, children, hideTitle, title = "Dialog", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      )}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {hideTitle ? (
        <VisuallyHidden>
          <CustomDialogTitle>{title}</CustomDialogTitle>
        </VisuallyHidden>
      ) : null}
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
)) 