export type NavItem = {
    label: {
      es: string;
      en: string;
    };
    href: string;
  };
  
  export const navigation: NavItem[] = [
    {
      label: { es: "Cenotes", en: "Cenotes" },
      href: "/cenotes",
    },
    {
      label: { es: "Galería", en: "Gallery" },
      href: "/galeria",
    },
    {
      label: { es: "Pedidas de mano", en: "Proposals" },
      href: "/pedidas-de-mano",
    },
    {
      label: { es: "Grupos", en: "Groups" },
      href: "/grupos",
    },
    {
      label: { es: "Contacto", en: "Contact" },
      href: "/contacto",
    },
    {
      label: { es: "Blog", en: "Blog" },
      href: "/blog",
    },
  ];