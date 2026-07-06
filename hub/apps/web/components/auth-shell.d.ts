/** Branded centered card used by the login and register pages. */
export declare function AuthShell({ title, subtitle, children, }: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}): import("react").JSX.Element;
export declare function Field({ label, ...props }: {
    label: string;
} & React.InputHTMLAttributes<HTMLInputElement>): import("react").JSX.Element;
