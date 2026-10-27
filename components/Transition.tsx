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
      // Out: the page softens away under a porcelain veil while the wordmark comes into focus.
      gsap
        .timeline()
        .set(curtain.current, { visibility: "visible", opacity: 0 })
        .to("main", { opacity: 0, filter: "blur(6px)", duration: 0.6, ease: "power2.in" }, 0)
        .to(curtain.current, { opacity: 1, duration: 0.6, ease: "power2.inOut" }, 0.1)
        .fromTo(".curtain__mark", { opacity: 0, letterSpacing: "0.6em", filter: "blur(10px)" }, { opacity: 1, letterSpacing: "0.32em", filter: "blur(0px)", duration: 1, ease: "power3.out" }, 0.2)
        .fromTo(".curtain__line", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, 0.3)
        .add(() => {
          setReady(false);
          router.push(url.pathname + url.hash);
        }, 0.9);
    },
    [pathname, router, lenis]
  );

  // New route committed: jump to top, then lift the veil.
  useEffect(() => {
    if (!pending.current) return;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      setReady(true);
      gsap.set("main", { opacity: 1, clearProps: "filter" });
      // In: the veil lifts by fading, uncovering the new page in place.
      gsap
        .timeline({
          onComplete: () => {
            gsap.set(curtain.current, { visibility: "hidden" });
            pending.current = false;
          },
        })
        .to(".curtain__mark", { opacity: 0, filter: "blur(8px)", duration: 0.5, ease: "power2.in" })
        .to(".curtain__line", { scaleX: 0, transformOrigin: "right", duration: 0.5, ease: "power2.in" }, 0)
        .to(curtain.current, { opacity: 0, duration: 0.9, ease: "power2.inOut" }, 0.25)
        .set(".curtain__line", { transformOrigin: "left" });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, lenis]);

  return (
    <TransitionContext.Provider value={{ ready, setReady, navigate }}>
      {children}
      <div ref={curtain} className="curtain" aria-hidden="true">
        <div className="curtain__mark">
          <span>Western</span>
          <small>Jewellers</small>
        </div>
        <i className="curtain__line" />
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
