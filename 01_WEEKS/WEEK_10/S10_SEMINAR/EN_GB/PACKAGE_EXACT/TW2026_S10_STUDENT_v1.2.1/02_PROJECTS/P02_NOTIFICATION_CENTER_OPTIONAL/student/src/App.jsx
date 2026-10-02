import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Link, MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import {
  markNotificationRead,
  refreshNotifications,
  selectMarkStatus,
  selectNotificationById,
  selectNotifications,
  selectRefreshError,
  selectRefreshStatus,
  selectUnreadCount,
} from "./store/notifications-slice.js";

// Routing and presentation stay here while the cross-route
// notification lifecycle lives in the Redux slice.
function Header() {
  const unread = useSelector(selectUnreadCount);

  return (
    <header>
      <Link to="/notifications">Notifications</Link>{" "}
      <span aria-label="Unread notifications">Unread: {unread}</span>
    </header>
  );
}

function NotificationList() {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const status = useSelector(selectRefreshStatus);
  const error = useSelector(selectRefreshError);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    dispatch(refreshNotifications());
  }, [dispatch]);

  const visible =
    filter === "unread"
      ? notifications.filter((item) => !item.read)
      : notifications;

  return (
    <main>
      <h1>Notification center</h1>
      <label>
        Show{" "}
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
        </select>
      </label>
      {status === "loading" && notifications.length === 0 && (
        <p role="status">Loading notifications</p>
      )}
      {error && <p role="alert">{error}</p>}
      <button type="button" onClick={() => dispatch(refreshNotifications())}>
        Refresh notifications
      </button>
      {visible.length === 0 && status !== "loading" ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {visible.map((item) => (
            <li key={item.id}>
              <Link to={`/notifications/${item.id}`}>{item.title}</Link>
              {!item.read && " (unread)"}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function NotificationDetail() {
  const { notificationId } = useParams();
  const dispatch = useDispatch();
  const notification = useSelector((state) =>
    selectNotificationById(state, notificationId),
  );
  const mark = useSelector((state) => selectMarkStatus(state, notificationId));

  if (!notification) {
    return (
      <main>
        <p role="alert">Notification not found</p>
        <Link to="/notifications">Back to notifications</Link>
      </main>
    );
  }

  return (
    <main>
      <h1>{notification.title}</h1>
      <p>{notification.read ? "Read" : "Unread"}</p>
      {mark.error && <p role="alert">{mark.error}</p>}
      {!notification.read && (
        <button
          type="button"
          disabled={mark.status === "loading"}
          onClick={() => dispatch(markNotificationRead(notification.id))}
        >
          {mark.status === "loading" ? "Marking read" : "Mark as read"}
        </button>
      )}
      <Link to="/notifications">Back to notifications</Link>
    </main>
  );
}

export function NotificationRoutes() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/notifications" element={<NotificationList />} />
        <Route
          path="/notifications/:notificationId"
          element={<NotificationDetail />}
        />
        <Route path="*" element={<main><p>Page not found</p></main>} />
      </Routes>
    </>
  );
}

export default function App({ store, initialEntries = ["/notifications"] }) {
  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <NotificationRoutes />
      </MemoryRouter>
    </Provider>
  );
}
