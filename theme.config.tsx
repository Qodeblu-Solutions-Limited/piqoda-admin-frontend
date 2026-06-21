
import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import DashBoardLogo from '@/components/dashboard-logo';
const config: DocsThemeConfig = {
  logo: (
    <span className=" inline-flex gap-2.5 items-center">
      <DashBoardLogo className="  text-default-900 h-8 w-8 [&>path:nth-child(3)]:text-background [&>path:nth-child(2)]:text-background" />
      <span className="  text-lg font-bold text-default ">HadiBRQ</span>
    </span>
  ),
  project: {
    link: "https://github.com/HadiBRQ",
  },
  banner: {
    key: "1.0-release",
    text: (
      <a href="/dashboard" target="_blank">
        🎉 DashBoard
      </a>
    ),
  },
  footer: {
    text: (
      <span>
        {new Date().getFullYear()} ©{" "}
        <a href="https://my-portfolio-v1-0-2025.vercel.app" target="_blank">
          Hadi Ibrahim
        </a>
        .
      </span>
    ),
  },
  themeSwitch: {
    useOptions() {
      return {
        light: 'Light',
        dark: 'Dark',
        system: 'System', // Add this line
      };
    },
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s – DashBoard",
    };
  },
};

export default config