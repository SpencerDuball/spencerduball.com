import React from "react";
import { Carousel as UiCarousel, CarouselContent, CarouselItem, useCarousel } from "@/components/ui/carousel";
import { cn } from "tailwind-variants";

function SlideSelector({ length, className, ...props }: React.ComponentProps<"div"> & { length: number }) {
  const [selected, setSelected] = React.useState(0);
  const { api } = useCarousel();

  React.useEffect(() => {
    if (!api) return () => {};

    // update the current index on init
    setSelected(api.selectedScrollSnap());

    // listen for next selection
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on("select", onSelect);

    // cleanup on unmount
    return () => api?.off("select", onSelect);
  }, [api]);

  return (
    <div className={cn("grid grid-flow-col justify-center", className)} {...props}>
      {Array.from({ length }).map((_, idx) => (
        <button key={idx} className="p-1" onClick={() => api?.scrollTo(idx)}>
          <div
            className={cn(
              "bg-muted h-4 w-4 rounded-full border-2",
              selected === idx && "border-secondary bg-secondary/80",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function Carousel({ children, className, ...props }: React.ComponentProps<"div">) {
  const images = React.Children.toArray(children);

  return (
    <UiCarousel className={cn("my-8 w-full", className)} {...props}>
      <CarouselContent>
        {images.map((image, idx) => (
          <CarouselItem className="[&>img]:my-0" key={idx}>
            {image}
          </CarouselItem>
        ))}
      </CarouselContent>
      <SlideSelector className="mt-4" length={images.length} />
    </UiCarousel>
  );
}
