const permissions = Object.freeze({
  member: Object.freeze(["report:readOwn", "report:submitOwn", "report:deleteOwn"]),
  moderator: Object.freeze(["report:readAny", "report:resolve", "report:deleteOwn"]),
  admin: Object.freeze(["report:readAny", "report:resolve", "report:deleteAny"])
});
export const hasPermission = (role, permission) => permissions[role]?.includes(permission) ?? false;
