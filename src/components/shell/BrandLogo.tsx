import { cn } from "@/lib/utils";
import animatedLogo from "@/assets/anvira-logo-animated.webp";
import staticLogo from "@/assets/anvira-logo.png";

/** Animated Anvira logo on a white tile; the still logo when the phone asks for reduced motion. */
const BrandLogo = ({ className }: { className?: string }) => (
  <span className={cn("flex items-center justify-center rounded-lg bg-white p-0.5 shadow-sm", className)}>
    <picture>
      <source srcSet={staticLogo} media="(prefers-reduced-motion: reduce)" />
      <img src={animatedLogo} alt="Anvira" className="h-full w-full object-contain" />
    </picture>
  </span>
);

export default BrandLogo;
