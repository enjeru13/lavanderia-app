/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { FaSignInAlt } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const loginSchema = z.object({
  email: z
    .string()
    .email("Formato de email inválido.")
    .min(1, "El email es requerido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
      toast.success("¡Bienvenido de nuevo!");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const success = await login(data);
      if (!success) {
        setError("email", {
          type: "manual",
          message: "Credenciales inválidas.",
        });
        setError("password", {
          type: "manual",
          message: "Credenciales inválidas.",
        });
        toast.error("Credenciales inválidas. Por favor, inténtalo de nuevo.");
      }
    } catch (error: any) {
      console.error("Error en el inicio de sesión:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error al iniciar sesión. Inténtalo de nuevo.";
      toast.error(errorMessage);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full md:w-1/2 border border-gray-200">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6 flex items-center justify-center gap-3">
            <FaSignInAlt className="text-blue-600" /> Iniciar Sesión
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Accede a tu cuenta para gestionar tu lavandería.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                {...register("email")}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:blue-indigo-500 text-base ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="tu@email.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                {...register("password")}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-base ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-md text-lg font-semibold transition-colors duration-200 ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes una cuenta?
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-4">
          <DotLottieReact
            src="https://lottie.host/72aec27a-4db9-446b-8358-f245e9d86c23/mGLYFxZos2.lottie"
            loop
            autoplay
            width={1000}
            height={1000}
          />
        </div>
      </div>
    </div>
  );
}
