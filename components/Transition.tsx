"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Ctx = {
  /** True once the current page is uncovered (after the loader or a page transition). */
  ready: boolean;
  setReady: (v: boolean) => void;
  navigate: (href: string) => void;
};

const TransitionContext = createContext<Ctx>({ ready: false, setReady: () => {}, navigate: () => {} });
export const usePageTransition = () => useContext(TransitionContext);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const curtain = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const [ready, setReady] = useState(false);

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      if (url.pathname === pathname) {
        if (url.hash) lenis?.scrollTo(url.hash, { duration: 1.6 });
        else lenis?.scrollTo(0, { duration: 1.6 });
        return;
      }
      if (pending.current) return;
      pending.current = true;
      router.prefetch(url.pathname);
      gsap
        .timeline()
        .set(curtain.current, { yPercent: 100, visibility: "visible" })
        .fromTo(".curtain__mark > *", { yPercent: 120 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.06 }, 0.35)
        .to(curtain.current, { yPercent: 0, duration: 0.9, ease: "expo.inOut" }, 0)
        .add(() => {
          setReady(false);
          router.push(url.pathname + url.hash);
        }, 0.95);
    },
    [pathname, router, lenis]
  );

  // New route committed: jump to top, then lift the curtain.
  useEffect(() => {
    if (!pending.current) return;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      setReady(true);
      gsap
        .timeline({
          onComplete: () => {
            gsap.set(curtain.current, { visibility: "hidden" });
            pending.current = false;
          },
        })
        .to(".curtain__mark > *", { yPercent: -120, duration: 0.6, ease: "expo.in", stagger: 0.04 })
        .to(curtain.current, { yPercent: -100, duration: 1, ease: "expo.inOut" }, 0.2);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, lenis]);

  return (
    <TransitionContext.Provider value={{ ready, setReady, navigate }}>
      {children}
      <div ref={curtain} className="curtain" aria-hidden="true">
        <div className="curtain__mark">
          <span>Western</span>
          <em>Jewellers</em>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

/** next/link with the curtain transition. Modifier-clicks and external links behave normally. */
export function TLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const { navigate } = usePageTransition();
  return (
    <Link
      href={href}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (/^(https?:|mailto:|tel:)/.test(href)) return;
        e.preventDefault();
        navigate(href);
      }}
    />
  );
}
