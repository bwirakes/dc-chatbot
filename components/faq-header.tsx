'use client'

import Link from "next/link"
import { Button } from "./ui/button"
import { ArrowLeft } from "lucide-react"
import { SidebarToggle } from "./sidebar-toggle"

export function FAQHeader() {
  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2 z-10 border-b">
      <SidebarToggle />
      <Link href="/" className="ml-auto">
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="size-4" />
          <span className="hidden md:inline">Back to Chat</span>
        </Button>
      </Link>
    </header>
  )
} 