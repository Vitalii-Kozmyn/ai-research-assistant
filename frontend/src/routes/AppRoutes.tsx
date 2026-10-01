import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route
                    path="/register"
                    element={<Register />}
                />
                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/"
                        element={<Home />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}