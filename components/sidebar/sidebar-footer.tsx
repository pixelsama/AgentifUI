"use client"
import { Settings, Sliders } from "lucide-react"
import { SidebarButton } from "./sidebar-button"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { cn } from "@lib/utils"
import { MobileUserButton } from "@components/mobile"
import { useMobile } from "@lib/hooks/use-mobile"
import { useRouter } from "next/navigation"
import { TooltipWrapper } from "@components/ui/tooltip-wrapper"

export function SidebarFooter() {
  const isMobile = useMobile()
  const router = useRouter()
  const { isExpanded } = useSidebarStore()
  return (
    <div className={cn(
      "flex flex-col gap-1.5 p-3 mt-auto",
    )}>
      {!isMobile && (
        // --- BEGIN COMMENT ---
        // 在slim状态下显示右侧tooltip，展开状态下不显示tooltip
        // --- END COMMENT ---
        isExpanded ? (
          <SidebarButton
            icon={<Sliders className={cn(
              "h-5 w-5 transition-transform duration-300",
            )} />}
            onClick={() => {
              router.push('/settings')
            }}
            aria-label="设置"
            variant="transparent"
            className="group"
          >
            <span className="font-serif">设置</span>
          </SidebarButton>
        ) : (
          <TooltipWrapper
            content="设置"
            id="sidebar-footer-settings-tooltip"
            placement="right"
            size="sm"
            showArrow={false}
          >
            <SidebarButton
              icon={<Sliders className={cn(
                "h-5 w-5 transition-transform duration-300",
              )} />}
              onClick={() => {
                router.push('/settings')
              }}
              aria-label="设置"
              variant="transparent"
              className="group"
            >
              <span className="font-serif">设置</span>
            </SidebarButton>
          </TooltipWrapper>
        )
      )}
      {isMobile && <MobileUserButton />}
    </div>
  )
}