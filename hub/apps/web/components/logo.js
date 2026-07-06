"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logo = Logo;
const link_1 = __importDefault(require("next/link"));
/** GamER wordmark — GAM purple / ER green, AZONIX. */
function Logo({ size = "md" }) {
    const cls = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
    return (<link_1.default href="/" className={`font-azonix ${cls} tracking-wide select-none`}>
      <span className="wordmark-gam glow-purple">GAM</span>
      <span className="wordmark-er glow-green">ER</span>
    </link_1.default>);
}
