import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";

import { ConfiguratorStep, type StepOption } from "@/components/configurator/ConfiguratorStep";
import { TravelProgress } from "@/components/configurator/TravelProgress";
import { buttonClass } from "@/components/ui/Button";
import { COMFORTS, DURATIONS, INTERESTS, RUSSIAN_LEVELS } from "@/lib/configurator/engine.ts";
import { firstMissingStep, parseAnswers, toQuery, type Partial4 } from "@/lib/configurator/params.ts";

export const metadata: Metadata = {
  title: "Votre Russie, en quatre questions",
  description: "Durée, envies, niveau de russe, confort : obtenez un premier profil de voyage en Russie, sans engagement.",
  robots: { index: false, follow: true },
};

const DURATION_LINES: Record<number, string> = {
  7: "L'essentiel : Moscou et Saint-Pétersbourg.",
  14: "Le temps de sortir des capitales.",
  21: "Le pays commence à se révéler.",
  28: "Le grand voyage, dans la limite des 30 jours de l'eVisa.",
};

type StepConfig = {
  name: "duree" | "profils" | "russe" | "confort";
  type: "single" | "multi";
  legend: string;
  help: string;
  options: StepOption[];
  selected: (a: Partial4) => string[];
  missing: string;
};

const STEPS: StepConfig[] = [
  {
    name: "duree",
    type: "single",
    legend: "Combien de temps vous donnez-vous ?",
    help: "Sur place, hors trajet aller-retour. Tous nos formats tiennent dans un eVisa de 30 jours.",
    options: DURATIONS.map((d) => ({ value: String(d), big: String(d), label: "jours", help: DURATION_LINES[d] })),
    selected: (a) => (a.days ? [String(a.days)] : []),
    missing: "Choisissez une durée pour continuer.",
  },
  {
    name: "profils",
    type: "multi",
    legend: "Qu'est-ce qui vous attire en Russie ?",
    help: "Choisissez-en autant que vous voulez. Nous en tirons les villes et les expériences à vous proposer.",
    options: INTERESTS.map((i) => ({ value: i.id, label: i.label, ru: i.ru })),
    selected: (a) => a.interests,
    missing: "Choisissez au moins une envie pour continuer.",
  },
  {
    name: "russe",
    type: "single",
    legend: "Quel est votre rapport au russe ?",
    help: "Aucun niveau n'est requis. Cela change seulement la préparation que nous vous proposerons.",
    options: RUSSIAN_LEVELS.map((l) => ({ value: l.id, label: l.label, help: l.help })),
    selected: (a) => (a.russian ? [a.russian] : []),
    missing: "Indiquez votre niveau pour continuer.",
  },
  {
    name: "confort",
    type: "single",
    legend: "Quel niveau de confort recherchez-vous ?",
    help: "Cela oriente les hébergements et les trains, pas le prix de la préparation.",
    options: COMFORTS.map((c) => ({ value: c.id, label: c.label, help: c.help })),
    selected: (a) => (a.comfort ? [a.comfort] : []),
    missing: "Choisissez un niveau de confort pour continuer.",
  },
];

/** Answers from the other steps, carried along as hidden fields. */
function HiddenAnswers({ answers, except }: { answers: Partial4; except: StepConfig["name"] }) {
  return (
    <>
      {except !== "duree" && answers.days && <input type="hidden" name="duree" value={answers.days} />}
      {except !== "profils" &&
        answers.interests.map((interest) => <input key={interest} type="hidden" name="profils" value={interest} />)}
      {except !== "russe" && answers.russian && <input type="hidden" name="russe" value={answers.russian} />}
      {except !== "confort" && answers.comfort && <input type="hidden" name="confort" value={answers.comfort} />}
    </>
  );
}

/**
 * Phase D · the configurator. Each step is a GET form rendered on the server:
 * no client state, works without JavaScript, shareable URL, and the browser's
 * back button behaves. next/form turns submissions into client navigations.
 */
export default async function ConfigurateurPage({ searchParams }: PageProps<"/configurateur">) {
  const params = await searchParams;
  const answers = parseAnswers(params);
  const missing = firstMissingStep(answers);
  const requested = Number(Array.isArray(params.etape) ? params.etape[0] : params.etape);
  const asked = Number.isInteger(requested) && requested >= 1 ? requested : missing;
  // Never skip an unanswered step; if someone continued without answering, say so
  const step = Math.min(asked, missing, 4);
  const error = asked > missing && missing <= 4 ? STEPS[missing - 1]?.missing : undefined;
  const config = STEPS[step - 1]!;
  const last = step === 4;

  return (
    <section data-surface="frost" className="min-h-[100svh] bg-surface text-fg">
      <div className="gutter mx-auto max-w-[1100px] pt-28 pb-24 md:pt-36">
        <h1 className="sr-only">Votre Russie, en quatre questions</h1>
        <TravelProgress step={step} />

        <Form key={step} action={last ? "/configurateur/resultat" : "/configurateur"} className="mt-12 md:mt-16">
          <HiddenAnswers answers={answers} except={config.name} />
          {/* A hidden field, not the button's name: next/form does not forward the submitter */}
          {!last && <input type="hidden" name="etape" value={step + 1} />}
          <ConfiguratorStep
            name={config.name}
            type={config.type}
            legend={config.legend}
            help={config.help}
            options={config.options}
            selected={config.selected(answers)}
            error={error}
          />

          <div className="mt-12 flex flex-col-reverse gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            {step > 1 ? (
              <Link href={`/configurateur?${toQuery(answers, step - 1)}`} className={buttonClass({ variant: "quiet" })}>
                <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
                Étape précédente
              </Link>
            ) : (
              <Link href="/" className={buttonClass({ variant: "quiet" })}>
                <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
                Retour à l&apos;accueil
              </Link>
            )}
            <button type="submit" className={buttonClass({ className: "w-full sm:w-auto" })}>
              {last ? "Voir votre Russie" : "Continuer"}
              <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </Form>

        <p className="mt-10 text-[0.85rem] text-fg-2">
          Quatre questions, sans engagement. Vos réponses restent dans l&apos;adresse de la page : rien n&apos;est
          enregistré.
        </p>
      </div>
    </section>
  );
}
