import type { GadgetPermissions } from "gadget-server";

/**
 * This metadata describes the access control configuration available in your application.
 * Grants that are not defined here are set to false by default.
 *
 * View and edit your roles and permissions in the Gadget editor at https://shinigami.gadget.app/edit/settings/permissions
 */
export const permissions: GadgetPermissions = {
  type: "gadget/permissions/v1",
  roles: {
    "signed-in": {
      storageKey: "signed-in",
      default: {
        read: true,
        action: true,
      },
      models: {
        KiraBooks: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        KiraGameCoin: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        KiraItemGift: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        KiraItems: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        KiraNotes: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        KiraRemember: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        KiraRun: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        KiraUserAchiv: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        KiraUserPair: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        KiraUsers: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        KiraUserStats: {
          read: true,
        },
      },
      actions: {
        registerCommands: true,
        removeCommands: true,
      },
    },
    unauthenticated: {
      storageKey: "unauthenticated",
    },
  },
};
