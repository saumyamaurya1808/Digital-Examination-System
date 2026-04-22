import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { server_url } from "../App"

export const ProtectedRouteUser = ({ children }) => {

    const [auth, setAuth] = useState(null);

    useEffect(() => {

        axios.get(`${server_url}/api/examinee/userdashboard`, {
            withCredentials: true
        })
            .then(() => setAuth(true))
            .catch(() => setAuth(false));

    }, []);

    if (auth === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-lg font-semibold text-gray-700">Checking authentication...</p>
            </div>
        );
    }

    if (!auth) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">

                <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">

                    <h2 className="text-2xl font-bold text-red-600 mb-4">
                        Protected Route
                    </h2>

                    <p className="text-gray-600 mb-6">
                        This page is protected. Please login to access the Examinee dashboard.
                    </p>

                    <Link
                        to="/"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Go to Login
                    </Link>

                </div>

            </div>
        );
    }

    return children;
};