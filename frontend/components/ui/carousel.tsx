"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const CarouselContext = React.createContext<{
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(true)

  const checkScrollability = React.useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollPrev(scrollLeft > 0)
      setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }, [])

  React.useEffect(() => {
    const element = scrollRef.current
    if (element) {
        element.addEventListener('scroll', checkScrollability)
        checkScrollability()
        const observer = new ResizeObserver(checkScrollability)
        observer.observe(element)
        return () => {
            element.removeEventListener('scroll', checkScrollability)
            observer.disconnect()
        }
    }
  }, [checkScrollability])


  const scrollPrev = React.useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth, behavior: "smooth" })
    }
  }, [])

  const scrollNext = React.useCallback(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth, behavior: "smooth" })
    }
  }, [])

  return (
    <CarouselContext.Provider
      value={{
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        ref={ref}
        className={cn("relative group", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        <div ref={scrollRef} className="overflow-x-auto snap-x snap-mandatory scrollbar-hide flex"> 
             {children}
        </div>
      </div>
    </CarouselContext.Provider>
  )
})
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex min-w-full", className)} 
      {...props}
    />
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-full flex-shrink-0 snap-center", 
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 z-10",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 z-10",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
