import {
  AnalyticsUpIcon,
  Building02Icon,
  CalculateIcon,
  CheckListIcon,
  CheckmarkCircle03Icon,
  Contact01Icon,
  CustomerService01Icon,
  DashboardSquareAddIcon,
  DiscoverCircleIcon,
  LicenseIcon,
  MoneyReceiveIcon,
  Notification01Icon,
  OrganicFoodIcon,
  PropertyAddIcon,
  UserGroupIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import type { SidebarConfig, SidebarItem } from "@/types/sidebar.types";
import type { TRole } from "@/types/user.types";

export const getSidebarConfig = (role: TRole): SidebarConfig => {
  const commonAccountItems: SidebarItem[] = [
    {
      title: "Notifications",
      url: "/notifications",
      icon: Notification01Icon,
      badge: 3,
    },
    { title: "Support", url: "/support", icon: CustomerService01Icon },
  ];

  const transparencyItems: SidebarItem[] = [
    { title: "Methodology", url: "/methodology", icon: CalculateIcon },
    { title: "Credits Ledger", url: "/credits-ledger", icon: CheckListIcon },
  ];

  const configs: Record<TRole, SidebarConfig> = {
    // ── SUPER ADMIN: Gets Clustered Sections ──
    super_admin: {
      topItems: [
        { title: "Dashboard", url: "/dashboard", icon: DashboardSquareAddIcon },
        { title: "Marketplace", url: "/marketplace", icon: DiscoverCircleIcon },
        { title: "Asset Portfolio", url: "/portfolio", icon: OrganicFoodIcon },
        { title: "Projects", url: "/projects", icon: ViewIcon },
        {
          title: "Track Verification",
          url: "/track-verification",
          icon: CheckListIcon,
        },
        {
          title: "Project Developers",
          url: "/project-owners",
          icon: UserGroupIcon,
        },
      ],
      sections: [
        {
          title: "OVERSIGHT",
          items: [
            {
              title: "Organizations",
              url: "/organizations",
              icon: Building02Icon,
            },
            {
              title: "User Management",
              url: "/user-management",
              icon: UserGroupIcon,
            },
            {
              title: "Compliance",
              url: "/compliance",
              icon: CheckmarkCircle03Icon,
            },
            {
              title: "Financial Control",
              url: "/financials",
              icon: MoneyReceiveIcon,
            },
          ],
        },
        { title: "TRANSPARENCY", items: transparencyItems },
        { title: "ACCOUNT PAGES", items: commonAccountItems },
      ],
    },

    // ── ALL OTHER ROLES: Straight Nav Items (No Clustering) ──
    admin: {
      topItems: [
        { title: "Dashboard", url: "/dashboard", icon: DashboardSquareAddIcon },
        { title: "Marketplace", url: "/marketplace", icon: DiscoverCircleIcon },
        { title: "Asset Portfolio", url: "/portfolio", icon: OrganicFoodIcon },
        { title: "Projects", url: "/projects", icon: ViewIcon },
        {
          title: "Track Verification",
          url: "/track-verification",
          icon: CheckListIcon,
        },
        {
          title: "Project Developers",
          url: "/project-owners",
          icon: UserGroupIcon,
        },
        { title: "Organizations", url: "/organizations", icon: Building02Icon },
        {
          title: "User Management",
          url: "/user-management",
          icon: UserGroupIcon,
        },
        {
          title: "Financial Control",
          url: "/financials",
          icon: MoneyReceiveIcon,
        },
        ...transparencyItems,
        ...commonAccountItems,
      ],
      sections: [],
    },
    org_admin: {
      topItems: [
        { title: "Dashboard", url: "/dashboard", icon: DashboardSquareAddIcon },
        { title: "Marketplace", url: "/marketplace", icon: DiscoverCircleIcon },
        { title: "Asset Registry", url: "/portfolio", icon: OrganicFoodIcon },
        {
          title: "Institutional Impact",
          url: "/compliance",
          icon: AnalyticsUpIcon,
        },
        { title: "Team Members", url: "/user-management", icon: UserGroupIcon },
        { title: "Contracts & Payouts", url: "/financials", icon: LicenseIcon },
        ...transparencyItems,
        ...commonAccountItems,
      ],
      sections: [],
    },
    sustainability_manager: {
      topItems: [
        { title: "Dashboard", url: "/dashboard", icon: DashboardSquareAddIcon },
        { title: "Marketplace", url: "/marketplace", icon: DiscoverCircleIcon },
        { title: "Asset Registry", url: "/portfolio", icon: OrganicFoodIcon },
        {
          title: "Institutional Impact",
          url: "/compliance",
          icon: AnalyticsUpIcon,
        },
        {
          title: "ESG Reports",
          url: "/compliance/reports",
          icon: CheckmarkCircle03Icon,
        },
        ...transparencyItems,
        ...commonAccountItems,
      ],
      sections: [],
    },
    org_auditor: {
      topItems: [
        { title: "Dashboard", url: "/dashboard", icon: DashboardSquareAddIcon },
        { title: "Marketplace", url: "/marketplace", icon: DiscoverCircleIcon },
        {
          title: "Asset Verification",
          url: "/portfolio",
          icon: CheckmarkCircle03Icon,
        },
        {
          title: "Institutional Reports",
          url: "/compliance/reports",
          icon: CheckmarkCircle03Icon,
        },
        {
          title: "Financial Audit",
          url: "/financials",
          icon: MoneyReceiveIcon,
        },
        {
          title: "My Organization",
          url: "/organization",
          icon: Building02Icon,
        },
        ...transparencyItems,
        ...commonAccountItems,
      ],
      sections: [],
    },
    financial_admin: {
      topItems: [
        { title: "Dashboard", url: "/dashboard", icon: DashboardSquareAddIcon },
        { title: "Marketplace", url: "/marketplace", icon: DiscoverCircleIcon },
        { title: "Asset Registry", url: "/portfolio", icon: OrganicFoodIcon },
        {
          title: "Compliance",
          url: "/compliance",
          icon: CheckmarkCircle03Icon,
        },
        { title: "Impact Analytics", url: "/analytics", icon: CalculateIcon },
        { title: "Organization", url: "/organization", icon: Building02Icon },
        ...transparencyItems,
        ...commonAccountItems,
      ],
      sections: [],
    },
    mrv_admin: {
      topItems: [
        { title: "Dashboard", url: "/dashboard", icon: DashboardSquareAddIcon },
        { title: "Marketplace", url: "/marketplace", icon: DiscoverCircleIcon },
        { title: "Projects", url: "/projects", icon: ViewIcon },
        {
          title: "Project Vetting",
          url: "/track-verification",
          icon: CheckListIcon,
        },
        {
          title: "Compliance",
          url: "/compliance",
          icon: CheckmarkCircle03Icon,
        },
        {
          title: "Organization Profile",
          url: "/organization",
          icon: Building02Icon,
        },
        ...transparencyItems,
        ...commonAccountItems,
      ],
      sections: [],
    },
    project_manager: {
      topItems: [
        { title: "Dashboard", url: "/dashboard", icon: DashboardSquareAddIcon },
        { title: "Marketplace", url: "/marketplace", icon: DiscoverCircleIcon },
        {
          title: "My Project Developers",
          url: "/project-owners",
          icon: UserGroupIcon,
        },
        {
          title: "Onboard Project Developer",
          url: "/project-owners/register",
          icon: PropertyAddIcon,
        },
        { title: "Projects", url: "/projects", icon: ViewIcon },
        {
          title: "Project Vetting",
          url: "/track-verification",
          icon: CheckListIcon,
        },
        // {
        //   title: "User Management",
        //   url: "/user-management",
        //   icon: UserGroupIcon,
        // },
        // {
        //   title: "Compliance",
        //   url: "/compliance",
        //   icon: CheckmarkCircle03Icon,
        // },
        ...transparencyItems,
        ...commonAccountItems,
      ],
      sections: [],
    },
    // ── PROJECT ADMIN: manages field agents + the developers they register ──
    project_admin: {
      topItems: [
        { title: "Dashboard", url: "/dashboard", icon: DashboardSquareAddIcon },
        {
          title: "Field Agents",
          url: "/field-agents",
          icon: Contact01Icon,
        },
        {
          title: "Project Developers",
          url: "/project-owners",
          icon: UserGroupIcon,
        },
        {
          title: "Onboard Project Developer",
          url: "/project-owners/register",
          icon: PropertyAddIcon,
        },
        { title: "Projects", url: "/projects", icon: ViewIcon },
        ...transparencyItems,
        ...commonAccountItems,
      ],
      sections: [],
    },
    // ── FIELD AGENT: unused in practice — the (agent) route group's own
    // layout redirects field_agent users to /agent before this sidebar ever
    // renders. Kept here only so `configs` stays a complete Record<TRole,...>.
    field_agent: {
      topItems: [
        { title: "Home", url: "/agent", icon: DashboardSquareAddIcon },
      ],
      sections: [],
    },
    project_owner: {
      topItems: [
        { title: "Dashboard", url: "/dashboard", icon: DashboardSquareAddIcon },
        { title: "Marketplace", url: "/marketplace", icon: DiscoverCircleIcon },
        {
          title: "Register Project",
          url: "/projects/new",
          icon: PropertyAddIcon,
        },
        { title: "My Projects", url: "/projects", icon: ViewIcon },
        {
          title: "Track Verification",
          url: "/track-verification",
          icon: CheckListIcon,
        },
        {
          title: "Compliance",
          url: "/compliance",
          icon: CheckmarkCircle03Icon,
        },
        ...transparencyItems,
        ...commonAccountItems,
      ],
      sections: [],
    },
  };

  return configs[role] || configs.project_owner;
};
