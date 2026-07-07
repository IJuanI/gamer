// Fake data for simulation mode
import { getSimulationMode } from "./simulation";

export interface SimulatedEmpresa {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  sector: string;
  description: string;
  isSimulated: true;
}

export interface SimulatedIdea {
  id: string;
  title: string;
  description: string;
  category?: string;
  budget?: string;
  createdAt: Date;
  isSimulated: true;
}

const FAKE_EMPRESAS: SimulatedEmpresa[] = [
  {
    id: "sim-1",
    name: "TechVentures AR",
    slug: "techventures-ar",
    tagline: "Realidad Aumentada para retail",
    sector: "AR/VR",
    description:
      "Desarrollamos soluciones de realidad aumentada para mejorar la experiencia de compra en tiendas físicas.",
    isSimulated: true,
  },
  {
    id: "sim-2",
    name: "GreenCode Solutions",
    slug: "greencode",
    tagline: "Sostenibilidad digital",
    sector: "Sustentabilidad",
    description:
      "Consultora especializada en transformación digital sostenible y reducción de huella de carbono.",
    isSimulated: true,
  },
  {
    id: "sim-3",
    name: "NeuroLab Paraná",
    slug: "neurolab",
    tagline: "Inteligencia artificial aplicada",
    sector: "IA/ML",
    description:
      "Centro de investigación y desarrollo en machine learning e IA para aplicaciones regionales.",
    isSimulated: true,
  },
];

const FAKE_IDEAS: SimulatedIdea[] = [
  {
    id: "sim-idea-1",
    title: "Dashboard interactivo de energía",
    description:
      "Necesitamos un dashboard en tiempo real para monitorear consumo de energía en pymes. Debe integrar datos de múltiples fuentes y generar reportes automáticos.",
    category: "Web",
    budget: "$5000 - $10000",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isSimulated: true,
  },
  {
    id: "sim-idea-2",
    title: "App de logística para pequeños comercios",
    description:
      "Aplicación móvil para rastrear pedidos y entregas. Necesita geolocalización, notificaciones push y integración con sistemas de pago.",
    category: "App móvil",
    budget: "$15000 - $25000",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isSimulated: true,
  },
  {
    id: "sim-idea-3",
    title: "Chatbot para atención al cliente",
    description:
      "Bot inteligente para responder consultas frecuentes en redes sociales. Debe estar entrenado en contexto local y temas de turismo.",
    category: "IA",
    budget: "A convenir",
    createdAt: new Date(),
    isSimulated: true,
  },
];

export async function getSimulatedEmpresas(): Promise<SimulatedEmpresa[]> {
  const isSimulation = await getSimulationMode();
  return isSimulation ? FAKE_EMPRESAS : [];
}

export async function getSimulatedIdeas(): Promise<SimulatedIdea[]> {
  const isSimulation = await getSimulationMode();
  return isSimulation ? FAKE_IDEAS : [];
}
