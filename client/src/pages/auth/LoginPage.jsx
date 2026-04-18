import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaLock, FaUser } from "react-icons/fa";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";
import { roleDefaultPath } from "../../utils/roleRedirect";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      const token = res?.data?.accessToken || res?.data?.token;
      const user = res?.data?.user;
      if (!token || !user) {
        toast.error("Unexpected login response");
        return;
      }
      login({ token, user });
      toast.success("Welcome back!");
      navigate(roleDefaultPath(user.role));
    },
    onError: (error) => toast.error(error.response?.data?.message || "Login failed"),
  });

  const onSubmit = (values) => mutation.mutate(values);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl grid md:grid-cols-2 app-card overflow-hidden">
        <div className="hidden md:flex flex-col justify-center p-10 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <p className="text-xs uppercase tracking-widest text-indigo-200">College ERP Platform</p>
          <h1 className="text-3xl font-bold mt-2">Modern Campus Operations in One Place</h1>
          <p className="mt-4 text-indigo-100 text-sm">
            Secure role-based dashboards for administrators, faculty, and students with real-time updates.
          </p>
        </div>

        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-sm text-slate-500 mb-6">Sign in to access your dashboard</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <div className="mt-1 flex items-center border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
              <FaUser className="text-slate-400 mr-2 text-sm" />
              <input
                {...register("email")}
                type="email"
                placeholder="you@college.edu"
                className="w-full outline-none text-sm"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-600">Password</label>
            <div className="mt-1 flex items-center border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
              <FaLock className="text-slate-400 mr-2 text-sm" />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full outline-none text-sm"
              />
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full btn-primary rounded-xl py-2.5 font-medium disabled:opacity-70"
          >
            {mutation.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
