import Link from "next/link";
import { ArrowLeft, Shield, Users, Bed, ShowerHead, UtensilsCrossed, Building, Lock, Baby } from "lucide-react";
import { SiteNav } from "@/components/site-nav";

const GREEN = "#3cff9e";
const PURPLE = "#8b6cff";
const MUTED = "#b6c2ff";
const BG = "#0b1020";

function HudFrame({
  children,
  label,
  className = "",
  accent = "purple",
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
  accent?: "purple" | "green";
}) {
  const accentColor = accent === "green" ? GREEN : PURPLE;
  return (
    <div
      className={`relative p-6 backdrop-blur-sm ${className}`}
      style={{
        backgroundColor: "rgba(18, 24, 45, 0.5)",
        border: `1px solid ${accentColor}33`,
        boxShadow: `0 0 0 1px ${accentColor}33, 0 0 10px ${accentColor}14, inset 0 0 10px ${accentColor}05`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-1px",
          left: "-1px",
          width: "20px",
          height: "20px",
          borderTop: `2px solid ${accentColor}80`,
          borderLeft: `2px solid ${accentColor}80`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-1px",
          right: "-1px",
          width: "20px",
          height: "20px",
          borderBottom: `2px solid ${accentColor}80`,
          borderRight: `2px solid ${accentColor}80`,
        }}
      />
      {label && (
        <div
          className="absolute -top-3 left-4 px-2 text-xs font-bold uppercase tracking-widest"
          style={{ backgroundColor: BG, color: accentColor }}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

const policies = [
  {
    icon: Shield,
    title: "1. Trato y Respeto",
    items: [
      "Tratar a todas las personas con respeto, empatía y consideración.",
      "No se tolerarán actitudes discriminatorias, ofensivas, violentas o de acoso de ningún tipo.",
      "Respetar opiniones, ideas y formas de trabajo distintas a las propias.",
      "No utilizar elementos ajenos sin previo consentimiento.",
      "Cualquier conflicto debe resolverse mediante el diálogo o con ayuda de la organización.",
    ],
  },
  {
    icon: Users,
    title: "2. Convivencia General",
    items: [
      "Mantener un ambiente colaborativo y cordial durante toda la duración del evento.",
      "Respetar los espacios comunes manteniendo el orden y la limpieza.",
      "Seguir las indicaciones del equipo organizador en todo momento.",
    ],
  },
  {
    icon: Bed,
    title: "3. Descanso y Zona para Dormir",
    items: [
      "Utilizar la zona de descanso exclusivamente para dormir o reposar.",
      "Mantener silencio y orden en este espacio.",
      "Mantener las luces de lámparas y pantallas apagadas.",
    ],
  },
  {
    icon: ShowerHead,
    title: "4. Baños e Higiene Personal",
    items: [
      "Hacer uso responsable de los insumos comunes (papel higiénico, jabón, etc.)",
      "Dejar las duchas y baños limpios luego de usarlos.",
      "Cuidar la higiene personal como parte del respeto hacia los demás participantes.",
    ],
  },
  {
    icon: UtensilsCrossed,
    title: "5. Comedor",
    items: [
      "Respetar los horarios establecidos para el uso del comedor.",
      "Mantener el espacio limpio, ordenado y libre de residuos.",
      "No retirar utensilios o elementos del comedor sin autorización.",
    ],
  },
  {
    icon: Building,
    title: "6. Cuidado del Espacio y Recursos",
    items: [
      "Cuidar las instalaciones, mobiliario y equipamiento del evento.",
      "No está permitido modificar espacios o recursos sin permiso.",
      "Cada participante es responsable de sus pertenencias personales.",
    ],
  },
  {
    icon: Lock,
    title: "7. Seguridad",
    items: [
      "No realizar acciones que puedan poner en riesgo la seguridad propia o ajena.",
      "Informar a la organización ante cualquier situación incómoda, insegura o fuera de lugar.",
      "No consumas alcohol ni sustancias ilegales en el evento.",
    ],
  },
];

const consequences = [
  "Advertencia verbal por parte de los organizadores.",
  "Expulsión del evento sin derecho a reembolso.",
  "Prohibición de participar en futuros eventos organizados por Paraná Game Jam.",
  "En casos graves, se podrá contactar a las autoridades correspondientes.",
  "Cualquier otro agravio al sentido común podrá derivar en las mismas medidas.",
];

export default function ConvivenciaPage() {
  return (
    <>
      <SiteNav />
      <main className="font-oxanium relative min-h-screen overflow-hidden" style={{ backgroundColor: BG }}>
        <div className="mx-auto max-w-4xl px-6 pt-24 pb-20">
          <Link
            href="/jam"
            className="mb-8 inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
            style={{ color: MUTED }}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
              <span style={{ color: PURPLE }}>Normas de</span> <span style={{ color: "#ffffff" }}>Convivencia</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base" style={{ color: MUTED, fontFamily: "var(--font-inter)" }}>
              Para garantizar una experiencia positiva, segura y respetuosa para todos los participantes, solicitamos
              el cumplimiento de las siguientes normas básicas de convivencia.
            </p>
          </div>

          {/* Intro & Important Notice */}
          <div className="mb-6 space-y-4">
            <HudFrame label="Bienvenida">
              <p className="text-base leading-relaxed" style={{ color: "#ffffff", fontFamily: "var(--font-inter)" }}>
                La <span style={{ color: GREEN }}>Paraná Game Jam</span> es un espacio inclusivo donde personas de
                todas las edades, géneros, orientaciones y niveles de experiencia se reúnen para crear videojuegos.
                Nuestro objetivo es fomentar la creatividad, el aprendizaje y la colaboración en un ambiente seguro y
                respetuoso.
              </p>
            </HudFrame>

            <HudFrame label="Importante" accent="green">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "rgba(60, 255, 158, 0.2)" }}
                >
                  <Baby className="h-6 w-6" style={{ color: GREEN }} />
                </div>
                <div>
                  <h3 className="mb-1 text-base font-semibold text-white">Menores de Edad</h3>
                  <p className="text-sm" style={{ color: MUTED, fontFamily: "var(--font-inter)" }}>
                    Los <span className="font-semibold" style={{ color: GREEN }}>menores de edad</span> deben estar
                    acompañados por un adulto responsable durante toda la Game Jam. El adulto será responsable del
                    menor y debe permanecer en las instalaciones.
                  </p>
                </div>
              </div>
            </HudFrame>
          </div>

          {/* Policies - 2 column layout for first 6 policies */}
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            {policies.slice(0, 6).map((policy) => {
              const Icon = policy.icon;
              return (
                <HudFrame key={policy.title} className="h-full">
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: "rgba(139, 108, 255, 0.15)" }}
                    >
                      <Icon className="h-5 w-5" style={{ color: PURPLE }} />
                    </div>
                    <h3 className="text-lg leading-tight font-semibold text-white">{policy.title}</h3>
                  </div>
                  <ul className="space-y-1">
                    {policy.items.map((item) => (
                      <li key={item} className="flex gap-1.5 text-sm" style={{ color: MUTED, fontFamily: "var(--font-inter)" }}>
                        <span className="mt-0.5" style={{ color: PURPLE }}>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </HudFrame>
              );
            })}
          </div>

          {/* Seguridad and Incumplimiento - Side by Side */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <HudFrame className="h-full">
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "rgba(139, 108, 255, 0.15)" }}
                >
                  <Lock className="h-5 w-5" style={{ color: PURPLE }} />
                </div>
                <h3 className="text-lg leading-tight font-semibold text-white">{policies[6].title}</h3>
              </div>
              <ul className="space-y-1">
                {policies[6].items.map((item) => (
                  <li key={item} className="flex gap-1.5 text-sm" style={{ color: MUTED, fontFamily: "var(--font-inter)" }}>
                    <span className="mt-0.5" style={{ color: PURPLE }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </HudFrame>

            <HudFrame label="Incumplimiento">
              <h3 className="mb-2 text-base font-semibold text-white">Consecuencias</h3>
              <p className="mb-2 text-sm" style={{ color: MUTED, fontFamily: "var(--font-inter)" }}>
                Los organizadores pueden tomar las siguientes medidas:
              </p>
              <ol className="space-y-1">
                {consequences.map((consequence, index) => (
                  <li key={consequence} className="flex gap-1.5 text-sm" style={{ color: MUTED, fontFamily: "var(--font-inter)" }}>
                    <span className="font-mono" style={{ color: "#ff6b6b" }}>{index + 1}.</span>
                    <span>{consequence}</span>
                  </li>
                ))}
              </ol>
            </HudFrame>
          </div>

          {/* Reporting */}
          <div className="mb-6 space-y-4">
            <HudFrame label="Reportar Incidentes">
              <h3 className="mb-2 text-base font-semibold text-white">¿Cómo Reportar?</h3>
              <p className="mb-2 text-sm" style={{ color: MUTED, fontFamily: "var(--font-inter)" }}>
                Si experimentás o sos testigo de cualquier comportamiento que viole estas normas, reportalo
                inmediatamente a cualquier miembro del <span style={{ color: GREEN }}>STAFF</span>.
              </p>
              <p className="text-sm" style={{ color: MUTED, fontFamily: "var(--font-inter)" }}>
                También podés contactarnos a través de nuestro{" "}
                <a href="mailto:contacto@paranagamejam.com" className="hover:underline" style={{ color: PURPLE }}>
                  email
                </a>{" "}
                o por{" "}
                <a
                  href="https://discord.gg/Kh6JDj44cE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: PURPLE }}
                >
                  Discord
                </a>
                .
              </p>
            </HudFrame>
          </div>

          {/* Agreement */}
          <HudFrame className="text-center" accent="green">
            <p className="mb-1 text-base font-semibold text-white">
              Al participar en la Paraná Game Jam, aceptás cumplir con estas normas de convivencia.
            </p>
            <p className="text-sm" style={{ color: MUTED, fontFamily: "var(--font-inter)" }}>
              ¡Gracias por ayudarnos a crear un evento increíble para toda la comunidad!
            </p>
          </HudFrame>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link
              href="/jam"
              className="inline-flex h-10 items-center justify-center rounded-md px-8 font-bold uppercase tracking-wider transition-transform hover:scale-105"
              style={{ backgroundColor: GREEN, color: BG }}
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-12 px-6" style={{ borderColor: "rgba(60, 255, 158, 0.1)", backgroundColor: BG }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-4">
            <span className="font-oxanium font-extrabold" style={{ color: GREEN }}>
              Paraná Game Jam
            </span>
            <span className="text-sm" style={{ color: MUTED }}>|</span>
            <span className="font-mono text-sm" style={{ color: MUTED }}>Game Jam Plus 2026</span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link href="/jam/convivencia" className="font-mono transition-colors hover:text-white" style={{ color: MUTED }}>
              Normas de Convivencia
            </Link>
            <a
              href="https://www.gamejamplus.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono transition-colors hover:text-white"
              style={{ color: MUTED }}
            >
              Game Jam Plus
            </a>
          </div>

          <p className="font-mono text-xs" style={{ color: MUTED }}>© 2026 Paraná Game Jam.</p>
        </div>
      </footer>
    </>
  );
}
