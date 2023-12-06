'use client'
import * as React from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";
// This line imports the ThemeProvider component from the "next-themes" library, renaming it as NextThemeProvider to avoid naming conflicts.
import type { ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider ({children,...props}:ThemeProviderProps){
    return <NextThemeProvider {...props}>{children}</NextThemeProvider>
}

// export function ThemeProvider ({children, ...props}: ThemeProviderProps) { ... }: This declares a functional component named ThemeProvider. It takes in props, including the children prop, which represents the nested components within the ThemeProvider.

// ThemeProviderProps is used as the type for the props to ensure that the component receives the expected properties.

// The {...props} syntax spreads the remaining props (excluding children) to the NextThemeProvider component.

// The component returns the NextThemeProvider component with the spread props and nested children components.