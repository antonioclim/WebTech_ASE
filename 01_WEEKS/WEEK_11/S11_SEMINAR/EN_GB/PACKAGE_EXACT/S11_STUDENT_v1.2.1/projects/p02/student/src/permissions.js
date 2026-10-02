const permissions = Object.freeze(Object.assign(Object.create(null), {
  member: Object.freeze(["report:readOwn", "report:submitOwn", "report:deleteOwn"]),
  moderator: Object.freeze(["report:readAny", "report:resolve", "report:deleteOwn"]),
  admin: Object.freeze(["report:readAny", "report:resolve", "report:deleteAny"])
}));
export function hasPermission(role, permission) {
  return typeof role === "string" && typeof permission === "string" && Object.hasOwn(permissions, role)
    ? permissions[role].includes(permission) : false;
}
