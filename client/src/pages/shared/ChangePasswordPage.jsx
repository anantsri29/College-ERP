import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import SectionCard from "../../components/common/SectionCard";
import AppButton from "../../components/common/AppButton";
import { authApi } from "../../api/authApi";

const ChangePasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => toast.success("Password changed"),
    onError: (e) => toast.error(e.response?.data?.message || "Failed to change password"),
  });

  return (
    <div className="space-y-4">
      <SectionCard title="Change Password" subtitle="Update your password securely">
        <form
          className="grid md:grid-cols-2 gap-4"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          <div>
            <label className="text-sm font-medium text-slate-700">Current Password</label>
            <input
              type="password"
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
              {...register("currentPassword", { required: "Current password is required", minLength: { value: 6, message: "Min 6 chars" } })}
            />
            {errors.currentPassword && <p className="mt-1 text-xs text-rose-600">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">New Password</label>
            <input
              type="password"
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
              {...register("newPassword", { required: "New password is required", minLength: { value: 6, message: "Min 6 chars" } })}
            />
            {errors.newPassword && <p className="mt-1 text-xs text-rose-600">{errors.newPassword.message}</p>}
          </div>
          <div className="md:col-span-2">
            <AppButton type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Updating..." : "Update Password"}
            </AppButton>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default ChangePasswordPage;

