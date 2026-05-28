import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import RegisterEmployeePage from "./pages/RegisterEmployeePage";
import AdminEmployeesPage from "./pages/AdminEmployeesPage";
import ManageClassroomPage from "./pages/ManageClassroomPage";
import ManageStudentPage from "./pages/ManageStudentPage";
import GradesPage from "./pages/GradesPage";
import InfoEmployeePage from "./pages/InfoEmployeePage";
import {
  ROUTES,
  getLandingRoute,
  getCurrentUserRole,
  isAuthenticated,
} from "./lib/routes";

function ProtectedRoute({ element, roles }) {
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (roles && roles.length) {
    const role = getCurrentUserRole();
    if (!roles.includes(role)) {
      return <Navigate to={getLandingRoute()} replace />;
    }
  }

  return element;
}

export default function App() {
  const landingRoute = getLandingRoute();

  return (
    <Routes>
      <Route
        path={ROUTES.ROOT}
        element={<Navigate to={landingRoute} replace />}
      />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterEmployeePage />} />
      <Route element={<MainLayout />}>
        <Route
          path={ROUTES.ADMIN_EMPLOYEES}
          element={
            <ProtectedRoute
              roles={["admin"]}
              element={<AdminEmployeesPage />}
            />
          }
        />
        <Route
          path={ROUTES.EMPLOYEE}
          element={
            <ProtectedRoute
              roles={["employee"]}
              element={<InfoEmployeePage />}
            />
          }
        />
        <Route
          path={ROUTES.CLASSES}
          element={
            <ProtectedRoute
              roles={["employee"]}
              element={<ManageClassroomPage />}
            />
          }
        />
        <Route
          path={ROUTES.STUDENTS}
          element={
            <ProtectedRoute
              roles={["employee"]}
              element={<ManageStudentPage />}
            />
          }
        />
        <Route
          path={ROUTES.SCORES}
          element={
            <ProtectedRoute roles={["employee"]} element={<GradesPage />} />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to={landingRoute} replace />} />
    </Routes>
  );
}
