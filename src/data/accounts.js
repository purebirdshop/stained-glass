const Plans = {
    DEMO:{
        "name":"Demo",
        "synonyms":[]
    },
    LAUNCH:{
        "name":"Launch",
        "synonyms":[
            "Basic"
        ]
    },
    GROWTH:{
        "name":"Growth",
        "synonyms":[]
    },
    IMPACT:{
        "name":"Impact",
        "synonyms":[]
    },
    MOVEMENT:{
        "name":"Movement",
        "synonyms":[
            "Enterprise"
        ]
    }
}

export const Roles = {
  STANDARD: "standard",
  LEAD: "lead",
  ADMIN: "administrator",
  ACCOUNT_REP: "account-representitive",
  FINANCE: "finance",
  REGIONAL: "regional"
};

export const Permissions = {
  VIEW_DASHBOARD: "view:dashboard",
  MANAGE_USERS: "manage:users",
  MANAGE_CLIENT_SETTINGS: "manage:client-settings",
  VIEW_FINANCIALS: "view:financials",
  EDIT_FINANCIALS: "edit:financials",
  VIEW_REPORTS: "view:reports",
  MANAGE_REGIONS: "manage:regions",
};

export const RolePermissions = {
  standard: [
    Permissions.VIEW_DASHBOARD,
    Permissions.VIEW_REPORTS,
  ],

  lead: [
    Permissions.VIEW_DASHBOARD,
    Permissions.VIEW_REPORTS,
    Permissions.MANAGE_USERS,
  ],

  administrator: [
    Permissions.VIEW_DASHBOARD,
    Permissions.MANAGE_USERS,
    Permissions.MANAGE_CLIENT_SETTINGS,
    Permissions.VIEW_REPORTS,
  ],

  "account-representitive": [
    Permissions.VIEW_DASHBOARD,
    Permissions.MANAGE_CLIENT_SETTINGS,
  ],

  finance: [
    // TODO: [IDEA] Limit access to finance specifically, maybe have user approval limited in this way as well.
    Permissions.VIEW_FINANCIALS,
    Permissions.EDIT_FINANCIALS,
    Permissions.VIEW_REPORTS
  ],

  regional: [
    // TODO: [IDEA] This would also limit access to different campuses or multiple campuses. Need to give a UI for the user to set up regions.
    Permissions.VIEW_DASHBOARD,
    Permissions.MANAGE_REGIONS,
    Permissions.VIEW_REPORTS
  ]
};

export default {Plans, Roles, Permissions, RolePermissions }