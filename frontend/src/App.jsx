import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import ManageClassroomPage from "./pages/ManageClassroomPage";
import ManageStudentPage from "./pages/ManageStudentPage";
import GradesPage from "./pages/GradesPage";
import InfoEmployeePage from "./pages/InfoEmployeePage";
import { ROUTES, getLandingRoute, isAuthenticated } from "./lib/routes";

function ProtectedRoute({ element }) {
  return isAuthenticated() ? element : <Navigate to={ROUTES.LOGIN} replace />;
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
      <Route element={<MainLayout />}>
        <Route
          path={ROUTES.EMPLOYEE}
          element={<ProtectedRoute element={<InfoEmployeePage />} />}
        />
        <Route
          path={ROUTES.CLASSES}
          element={<ProtectedRoute element={<ManageClassroomPage />} />}
        />
        <Route
          path={ROUTES.STUDENTS}
          element={<ProtectedRoute element={<ManageStudentPage />} />}
        />
        <Route
          path={ROUTES.SCORES}
          element={<ProtectedRoute element={<GradesPage />} />}
        />
      </Route>
      <Route path="*" element={<Navigate to={landingRoute} replace />} />
    </Routes>
  );
}
