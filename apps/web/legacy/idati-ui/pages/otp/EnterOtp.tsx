import { useState } from "react";
import axios from "axios";
import { ArrowLeft2, Lock1 } from "iconsax-react";
import { toast } from "sonner";
import Button from "../../components/Button";
import { useStates } from "../../contexts/StatesContext";
import RememberPc from "./RememberPc";

type EnterOtpProps = {
  onBack?: () => void;
};

export default function EnterOtp({ onBack }: EnterOtpProps) {
  const {
    email,
    userProfile,
    BASE_URL,
    enteredOtp,
    setEnteredOtp,
    setAccessToken,
    setUserProfile,
    tenant,
    triggerUpdate,
    handleLogout,
  } = useStates();

  const [isLoading, setIsLoading] = useState(false);
  const [rememberPcSelected, setRememberPcSelected] = useState(false);
  const destinationEmail = userProfile?.email ?? email;

  function goBack() {
    setEnteredOtp("");
    if (onBack) {
      onBack();
      return;
    }
    handleLogout();
  }

  async function tokenVerificationHandler() {
    const otp = String(enteredOtp).trim();
    if (!otp) {
      toast.error("Enter the verification code sent to your email.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/v2/auth/verify-otp?rememberDevice=${rememberPcSelected}`,
        { otp, email: destinationEmail },
        {
          headers: {
            Authorization: `Bearer ${userProfile?.accessToken}`,
            "X-Tenant-ID": tenant,
            "Content-Type": "application/json",
          },
        },
      );

      toast.success(res?.data?.message ?? "Email verified");
      const data = res.data.data;
      const returnedUser = {
        name: data?.name,
        tenantId: data?.tenantId,
        email: data?.email,
        loginType: data?.loginType,
        businessId: data?.businessId,
        accessToken: data?.authToken?.token,
        accountType: data?.accountType,
        role: data?.role,
        hasSetPassword: data?.hasSetPassword,
      };

      localStorage.removeItem("accessToken");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("expireAt");
      setUserProfile(returnedUser);
      setAccessToken(data?.authToken?.token);
      localStorage.setItem("accessToken", data?.authToken?.token);
      localStorage.setItem("expireAt", String(Date.now() + 23 * 60 * 60 * 1000));
      localStorage.setItem("userProfile", JSON.stringify(returnedUser));
      triggerUpdate();
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "We could not verify that code. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={goBack}
          className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#36584e] transition hover:bg-white hover:text-[#174c3c]"
        >
          <ArrowLeft2 size={18} aria-hidden="true" />
          Change email
        </button>

        <div className="rounded-3xl border border-[#dfe4dc] bg-white p-6 shadow-[0_20px_55px_rgba(23,76,60,0.10)] sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4d5] text-[#174c3c]">
            <Lock1 size={24} aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-bold tracking-[0.18em] text-[#527064]">SECURE SIGN IN</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#17201d]">Check your email</h1>
          <p className="mt-3 text-sm leading-6 text-[#63706b]">
            Enter the one-time verification code sent to
            {destinationEmail ? <strong className="block text-[#263b34]">{destinationEmail}</strong> : " your email address"}.
          </p>

          <div className="mt-7">
            <label htmlFor="otp" className="text-sm font-semibold text-[#263b34]">Verification code</label>
            <input
              id="otp"
              autoFocus
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={enteredOtp}
              onChange={(event) => setEnteredOtp(event.target.value.replace(/\D/g, ""))}
              placeholder="Enter your code"
              className="mt-2 block min-h-[52px] w-full rounded-xl border border-[#cfd8d2] bg-white px-4 py-3 text-center text-xl font-semibold tracking-[0.28em] text-[#17201d] placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:border-[#174c3c] focus:outline-none"
            />
          </div>

          <RememberPc
            rememberPcSelected={rememberPcSelected}
            setRememberPcSelected={setRememberPcSelected}
          />

          <div className="mt-6">
            <Button onClick={tokenVerificationHandler} isLoading={isLoading}>
              Verify and continue
            </Button>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-[#7a8581]">
            Entered the wrong address? Use “Change email” to return safely.
          </p>
        </div>
      </section>
    </main>
  );
}
