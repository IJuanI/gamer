import {
  GamepadIcon,
  GemIcon,
  CrosshairIcon,
  ShieldIcon,
  SwordIcon,
  AlienIcon,
} from "./gaming-icons";
import type { IconName } from "@/lib/variation";

export type IconComponent = typeof GamepadIcon;

export const ICON_MAP: Record<IconName, IconComponent> = {
  gamepad: GamepadIcon,
  gem: GemIcon,
  crosshair: CrosshairIcon,
  shield: ShieldIcon,
  sword: SwordIcon,
  alien: AlienIcon,
};
