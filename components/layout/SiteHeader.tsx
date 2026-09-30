"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Wordmark } from "@/components/brand/Wordmark";
import { ButtonLink } from "@/components/ui/Button";
import { Track } from "@/components/ui/Track";
import { ctas, nav, site } from "@/data/site";
import { pauseScroll, resumeScroll } from "@/lib/scroll";

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

export function SiteHeader() {
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 24,
    () => false,
  );
  // Transparent only over the homepage hero; every other page starts on a light surface
  const overHero = usePathname() === "/";
  const solid = scrolled || !overHero;
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const items = nav.filter((item) => item.ready);

  useEffect(() => {
    if (!open) return;
    const menuButton = menuButtonRef.current;
    pauseScroll();
    closeButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      resumeScroll();
      menuButton?.focus();
    };
  }, [open]);

  return (
    <header
      data-surface="night"
      className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-base ease-verste ${
        solid ? "border-white/10 bg-night/85 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div className="gutter mx-auto flex h-16 max-w-[1440px] items-center justify-between md:h-20">
        <Link
          href="/"
          aria-label="Verste, Russia Travel, accueil"
          className={`flex origin-left items-center gap-4 text-[1.6rem] text-fg transition-transform duration-base ease-verste md:text-[2rem] ${scrolled ? "scale-[0.9]" : ""}`}
        >
          <Wordmark animate />
          <span aria-hidden="true" className="label hidden border-l border-white/20 py-1 pl-4 text-[0.62rem] text-fg-2 sm:inline">
            Russia Travel
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden xl:block">
          <ul className="flex items-center gap-6 xl:gap-8">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="label whitespace-nowrap text-fg-2 transition-colors duration-fast hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Track event="hero_cta_click" props={{ cta: "build", from: "header" }}>
                <ButtonLink href={ctas.build.href} size="sm">
                  {ctas.build.label}
                </ButtonLink>
              </Track>
            </li>
          </ul>
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          className="-mr-2 inline-flex size-11 items-center justify-center text-fg xl:hidden"
        >
          <Menu aria-hidden="true" className="size-6" strokeWidth={1.5} />
          <span className="sr-only">Ouvrir le menu</span>
        </button>
      </div>

      {open && (
        <div
          id="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-lenis-prevent
          className="gutter fixed inset-0 z-50 flex flex-col bg-night pb-[max(2rem,env(safe-area-inset-bottom))] xl:hidden"
        >
          <div className="flex h-16 items-center justify-between">
            <span className="text-[1.6rem] text-fg">
              <Wordmark />
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              className="-mr-2 inline-flex size-11 items-center justify-center text-fg"
            >
              <X aria-hidden="true" className="size-6" strokeWidth={1.5} />
              <span className="sr-only">Fermer le menu</span>
            </button>
          </div>

          <nav aria-label="Navigation principale" className="mt-12 flex-1">
            <ul className="flex flex-col border-t border-line">
              {items.map((item) => (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-5 font-display font-semicond text-h2 text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Track event="hero_cta_click" props={{ cta: "build", from: "menu" }}>
            <ButtonLink href={ctas.build.href} className="w-full" onClick={() => setOpen(false)}>
              {ctas.build.label}
            </ButtonLink>
          </Track>
          <p className="label mt-6 text-fg-2">{site.signature}</p>
        </div>
      )}
    </header>
  );
}
