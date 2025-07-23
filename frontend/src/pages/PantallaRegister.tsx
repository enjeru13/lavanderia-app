import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import { authService } from "../services/authService";
import { toast } from "react-toastify";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const registerSchema = z
  .object({
    name: z.string().trim().nullable().optional(),
    email: z
      .string()
      .email("Formato de email inválido.")
      .min(1, "El email es requerido."),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
      toast.info("Ya estás autenticado.");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterFormInputs) => {
    setError("email", { message: undefined });
    setError("password", { message: undefined });
    setError("confirmPassword", { message: undefined });

    try {
      const response = await authService.register({
        name: data.name || null,
        email: data.email,
        password: data.password,
        role: "EMPLOYEE",
      });
      toast.success(
        response.message || "Registro exitoso. Por favor, inicia sesión."
      );
      navigate("/login");
    } catch (err: unknown) {
      let errorMessage = "Error al registrar usuario.";
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          errorMessage =
            "El email ya está registrado. Por favor, usa otro o inicia sesión.";
          setError("email", { type: "manual", message: errorMessage });
        } else {
          errorMessage = err.response?.data?.message || err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      console.error("Error en el registro:", errorMessage);
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
          <h2 className="text-3xl font-bold text-center text-green-700 mb-6 flex items-center justify-center gap-3">
            <FaUserPlus className="text-green-600" /> Registrar Cuenta
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Crea una nueva cuenta de usuario.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre (opcional)
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-500 text-base ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Tu nombre"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

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
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-500 text-base ${
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
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-500 text-base ${
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...register("confirmPassword")}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-500 text-base ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-md text-lg font-semibold transition-colors duration-200 ${
                isSubmitting
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Registrar"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="text-green-600 hover:underline font-medium"
            >
              Inicia Sesión
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-4">
          <DotLottieReact
            src="https://lottie.host/44be4efd-be38-473d-9347-7481f763d414/UZK84U6TlD.lottie"
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
