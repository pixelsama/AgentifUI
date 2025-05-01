"use client"
import { Settings, Sun, Moon, HelpCircle } from "lucide-react"
import { SidebarButton } from "./sidebar-button"
import { useThemeStore } from "@lib/stores/theme-store"
import { cn } from "@lib/utils"

export function SidebarFooter() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className={cn(
      "flex flex-col gap-2.5 p-3 mt-auto",
      "relative",
      "bg-gradient-to-t from-background via-background to-transparent pt-8"
    )}>
      {/* 分隔线 - 使用渐变效果代替实线边框 */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-muted/40 to-transparent"></div>
      
      <SidebarButton
        icon={<Settings className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />}
        text="设置"
        onClick={() => console.log("Settings")}
        aria-label="设置"
        className="group"
      />
      <SidebarButton
        icon={theme === "light" 
          ? <Moon className="h-5 w-5 transition-all duration-300 group-hover:scale-110" /> 
          : <Sun className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-400" />
        }
        text={theme === "light" ? "暗色模式" : "亮色模式"}
        onClick={toggleTheme}
        aria-label={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
        className="group"
      />
      <SidebarButton
        icon={<HelpCircle className="h-5 w-5 transition-all duration-300 group-hover:text-primary" />}
        text="帮助"
        onClick={() => console.log("Help")}
        aria-label="帮助"
        className="group"
      />
    </div>
  )
} 