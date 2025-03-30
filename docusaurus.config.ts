import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Pawtograder',
  tagline: 'Where every submission gets a round of appaws.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.pawtograder.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'pawtograder', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: "docs/staff",
          routeBasePath: "staff",
          sidebarPath: './sidebars/staff.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/pawtograder/docs/tree/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'students',
        path: 'docs/students',
        sidebarPath: './sidebars/students.ts',
        routeBasePath: 'students',
      },
    ],
    // [
    //   '@docusaurus/plugin-content-docs',
    //   {
    //     id: 'staff',
    //     path: 'docs/staff',
    //     sidebarPath: './sidebars/staff.ts',
    //     routeBasePath: 'staff',
    //   },
    // ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'developers',
        path: 'docs/developers',
        sidebarPath: './sidebars/developers.ts',
        routeBasePath: 'developers',
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/pawtograder-social-card.jpg',
    navbar: {
      title: 'Pawtograder',
      logo: {
        alt: 'Pawtograder Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Students',
          docsPluginId: 'students',
        },
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Course Staff',
          // docsPluginId: 'staff',
        },
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Developers',
          docsPluginId: 'developers',
        },
        {
          href: 'https://github.com/pawtograder',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        // {
        //   title: 'Documentation',
        //   items: [
        //     {
        //       label: 'Students Guide',
        //       to: '/students/intro',
        //     },
        //     {
        //       label: 'Course Staff Guide',
        //       to: '/staff/intro',
        //     },
        //     {
        //       label: 'Developer Guide',
        //       to: '/developers/intro',
        //     },
        //   ],
        // },
        // {
        //   title: 'Community',
        //   items: [
        //     {
        //       label: 'Stack Overflow',
        //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
        //     },
        //     {
        //       label: 'Discord',
        //       href: 'https://discordapp.com/invite/docusaurus',
        //     },
        //     {
        //       label: 'X',
        //       href: 'https://x.com/docusaurus',
        //     },
        //   ],
        // },
        // {
        //   title: 'More',
        //   items: [
        //     {
        //       label: 'Blog',
        //       to: '/blog',
        //     },
        //     {
        //       label: 'GitHub',
        //       href: 'https://github.com/facebook/docusaurus',
        //     },
        //   ],
        // },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Jonathan Bell.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
