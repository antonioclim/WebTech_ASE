const initialState = Object.freeze({
  ids: Object.freeze([]),
  entities: Object.freeze({}),
  refreshStatus: "idle",
  refreshError: null,
  refreshRequestId: null,
  markById: Object.freeze({})
});

export const notificationsAdapter = Object.freeze({});
export const resetNotifications = () => ({ type: "notifications/reset" });
export const refreshNotifications = () => ({ type: "notifications/refresh-unavailable" });
export const markNotificationRead = (id) => ({ type: "notifications/mark-unavailable", payload: id });
export const notificationsReducer = (state = initialState) => state;

export const selectNotifications = () => initialState.ids;
export const selectNotificationById = () => undefined;
export const selectUnreadCount = () => 0;
export const selectRefreshStatus = () => "idle";
export const selectRefreshError = () => null;
export const selectMarkStatus = () => ({ status: "idle", error: null });
