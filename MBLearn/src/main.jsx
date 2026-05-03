import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './router.jsx'
import { ContextProvider } from './contexts/ContextProvider'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Toaster } from './components/ui/sonner';
import { BrowserRouter } from "react-router-dom";
import { CarouselContentProvider } from './contexts/CarourselContext'
import { CategoriesProvider } from './contexts/CategoriesFetchContext'
import '../../MBLearn/bootstrap.js';

createRoot(document.getElementById("root")).render(
    <MantineProvider
    withGlobalStyles
    withNormalizeCSS
    theme={{
        colors: {
        primary: ['hsl(218,97%,26%)'], // Change primary color globally
        },
        components: {
        Stepper: {
            styles: {
            stepIcon: ({ active }) => ({
                backgroundColor: active ? 'hsl(218,97%,26%) !important' : 'transparent',
                color: active ? 'white' : 'inherit',
                border: `2px solid ${active ? 'hsl(218,97%,26%) !important' : 'var(--mantine-color-gray-4)'}`,
                transition: 'background-color 0.3s ease, border-color 0.3s ease',
            }),
            },
        },
        },
    }}
    >
    <ContextProvider>
        <CategoriesProvider>
        <CarouselContentProvider>
            <RouterProvider router={router} />
            <Toaster />
        </CarouselContentProvider>
        </CategoriesProvider>
    </ContextProvider>
    </MantineProvider>
);
