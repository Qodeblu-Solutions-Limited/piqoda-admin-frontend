

export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
};
export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

function isMenuActive(pathname: string, href: string) {
  return (
    pathname === href ||
    pathname.endsWith(href) ||
    pathname.includes(`${href}/`)
  );
}

export function getMenuList(pathname: string, t: any): Group[] {
  return [
    {
      groupLabel: t("dashboard"),
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard",
          label: t("dashboard"),
          active: isMenuActive(pathname, "/dashboard"),
          icon: "heroicons-outline:home",
          submenus: [],
        },
        {
          id: "subscriptions",
          href: "/subscriptions",
          label: t("subscriptions"),
          active: isMenuActive(pathname, "/subscriptions"),
          icon: "heroicons-outline:currency-dollar",
          submenus: [],
        },
      ],
    },
  ];
}
export function getHorizontalMenuList(pathname: string, t: any): Group[] {
  return [
    {
      groupLabel: t("dashboard"),
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard",
          label: t("dashboard"),
          active: isMenuActive(pathname, "/dashboard"),
          icon: "heroicons-outline:home",
          submenus: [],
        },
        {
          id: "subscriptions",
          href: "/subscriptions",
          label: t("subscriptions"),
          active: isMenuActive(pathname, "/subscriptions"),
          icon: "heroicons-outline:currency-dollar",
          submenus: [],
        },
      ],
    },
  ];
}