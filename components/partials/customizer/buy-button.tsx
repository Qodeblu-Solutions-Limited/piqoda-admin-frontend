'use client'
import { useTheme } from 'next-themes';
import React from 'react'
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useMediaQuery } from '@/hooks/use-media-query';

const BuyButton = () => {
    const { theme: mode } = useTheme();
    const isMobile = useMediaQuery("(min-width: 768px)");
    return (
        <>
            <Button asChild size={!isMobile ? "sm" : "md"} fullWidth color={mode !== 'light' ? 'secondary' : 'default'}>
                <Link href="#">Buy Now</Link>
            </Button>
            <Button asChild size={!isMobile ? "sm" : "md"} fullWidth color={mode !== 'light' ? 'secondary' : 'default'}>
                <Link
                    href="#"
                    target="__blank">
                    Our Portfolio
                </Link>
            </Button>
        </>
    )
}

export default BuyButton