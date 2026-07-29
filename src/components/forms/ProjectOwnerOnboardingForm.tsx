"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CustomInput from "@/components/CustomInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authClient } from "@/lib/auth";
import { axiosClient } from "@/lib/axiosClient";
import { ProjectOwnerService } from "@/lib/services/project-owner-service";
import { cn } from "@/lib/utils";
import {
  projectOwnerOnboardingSchema,
  type TProjectOwnerOnboardingInput,
} from "@/types/onboarding.types";

const STEPS = [
  { id: 1, title: "Identity Register" },
  { id: 2, title: "Payout Details" },
  { id: 3, title: "Porject Site Details" },
  { id: 4, title: "System Finalization" },
];

export default function ProjectOwnerOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const router = useRouter();

  const [isMomoSameAsContact, setIsMomoSameAsContact] = useState(false);
  const [isAccountNameSameAsUser, setIsAccountNameSameAsUser] = useState(false);

  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as any)?.role === "super_admin";

  useEffect(() => {
    if (isAdmin) {
      axiosClient
        .get("/users/role?role=admin")
        .then((res) => setAdmins(res.data.data))
        .catch((err) => console.error("Failed to fetch admins", err));
    }
  }, [isAdmin]);

  const form = useForm<TProjectOwnerOnboardingInput>({
    resolver: zodResolver(projectOwnerOnboardingSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      password: "",
      countryOfOperation: "Ghana",
      paymentMethod: "momo",
      assignmentType: "primary",
      isB2cAssignment: true,
      momoNumber: "",
      momoNetwork: "",
      bankName: "",
      accountNumber: "",
      accountName: "",
      region: "",
      village: "",
      latitude: "",
      longitude: "",
      areaHectares: "",
      partnerId: null as any,
    },
  });

  const watchedContactNumber = form.watch("contactNumber");
  const watchedFirstName = form.watch("firstName");
  const watchedLastName = form.watch("lastName");
  const watchedPaymentMethod = form.watch("paymentMethod");

  // Sync contact number to momo number if toggled
  useEffect(() => {
    if (isMomoSameAsContact && watchedContactNumber) {
      form.setValue("momoNumber", watchedContactNumber);
    }
  }, [isMomoSameAsContact, watchedContactNumber, form]);

  // Sync account name to entity name if toggled
  useEffect(() => {
    if (isAccountNameSameAsUser) {
      const fullName =
        `${watchedFirstName || ""} ${watchedLastName || ""}`.trim();
      form.setValue("accountName", fullName);
    }
  }, [isAccountNameSameAsUser, watchedFirstName, watchedLastName, form]);

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1)
      fieldsToValidate = [
        "firstName",
        "lastName",
        "contactNumber",
        "password",
        "countryOfOperation",
      ];
    else if (currentStep === 2) {
      fieldsToValidate = ["paymentMethod", "accountName"];
      if (watchedPaymentMethod === "bank")
        fieldsToValidate.push("bankName", "accountNumber");
      if (watchedPaymentMethod === "momo")
        fieldsToValidate.push("momoNetwork", "momoNumber");
    } else if (currentStep === 3)
      fieldsToValidate = ["region", "latitude", "longitude", "areaHectares"];

    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = async (data: TProjectOwnerOnboardingInput) => {
    setLoading(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        contactNumber: data.contactNumber,
        password: data.password,
        countryOfOperation: data.countryOfOperation,
        partnerId: data.partnerId,
        assignedAdminId: data.assignedAdminId,
        assignmentType: data.assignmentType,
        isB2cAssignment: data.isB2cAssignment,
        bankDetails:
          data.paymentMethod === "bank"
            ? {
                bankName: data.bankName || "",
                accountNumber: data.accountNumber || "",
                accountName: data.accountName || null,
              }
            : null,
        momoDetails:
          data.paymentMethod === "momo"
            ? {
                network: data.momoNetwork || "",
                number: data.momoNumber || "",
                accountName: data.accountName || null,
              }
            : null,
        farmPlot: data.region
          ? {
              region: data.region,
              village: data.village || null,
              centroid: {
                lat: Number(data.latitude),
                lng: Number(data.longitude),
              },
              areaHectares: Number(data.areaHectares),
            }
          : null,
      };

      await ProjectOwnerService.onboardProjectOwner(payload);
      toast.success("Project Owner registered successfully!");
      router.push("/projects/new");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please check the details.",
      );
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Editorial Stepper ── */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
            [ STEP 0{currentStep} / 0{STEPS.length} ]
          </span>
          <span className="font-bold text-[10px] uppercase tracking-widest text-slate-500">
            {STEPS[currentStep - 1].title}
          </span>
        </div>
        <div className="relative h-[2px] w-full bg-slate-200 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-slate-900"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "circOut" }}
          />
        </div>
        <div className="flex justify-between mt-3">
          {STEPS.map((step) => (
            <span
              key={step.id}
              className={cn(
                "text-[9px] font-bold uppercase tracking-widest transition-colors",
                currentStep >= step.id ? "text-slate-900" : "text-slate-400",
              )}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="space-y-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white border border-slate-200 p-8 md:p-12 shadow-sm"
            >
              {/* ── Step 1: Account Info ── */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="border-b border-slate-200 pb-6 mb-8">
                    <h2 className="text-3xl font-sans text-slate-900 tracking-tight mb-2">
                      Identity Profile
                    </h2>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                      Register primary credentials and jurisdictional data.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput
                      name="firstName"
                      label="Legal First Name"
                      placeholder="e.g. Daniel"
                      control={form.control}
                      type="text"
                      disabled={loading}
                    />
                    <CustomInput
                      name="lastName"
                      label="Legal Last Name"
                      placeholder="e.g. Asante"
                      control={form.control}
                      type="text"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput
                      name="contactNumber"
                      label="Primary Phone (ID)"
                      placeholder="+233..."
                      control={form.control}
                      type="text"
                      disabled={loading}
                    />
                    <CustomInput
                      name="email"
                      label="Email Address (Optional)"
                      placeholder="contact@domain.com"
                      control={form.control}
                      type="email"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput
                      name="password"
                      label="System Access Key"
                      placeholder="Min. 8 chars"
                      control={form.control}
                      type="password"
                      disabled={loading}
                    />
                    <CustomInput
                      name="countryOfOperation"
                      label="Operating Jurisdiction"
                      placeholder="Ghana"
                      control={form.control}
                      type="text"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* ── Step 2: Payment Details ── */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="border-b border-slate-200 pb-6 mb-8">
                    <h2 className="text-3xl font-serif text-slate-900 tracking-tight mb-2">
                      Payout Details
                    </h2>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                      Configure climate revenue disbursement channels.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Select Routing Network
                    </Label>
                    <RadioGroup
                      defaultValue={watchedPaymentMethod}
                      onValueChange={(v) =>
                        form.setValue("paymentMethod", v as "bank" | "momo")
                      }
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="momo"
                          id="momo"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="momo"
                          className="flex flex-col items-start p-6 border border-slate-200 bg-slate-50 hover:bg-slate-100 peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:bg-white cursor-pointer transition-all"
                        >
                          <Smartphone
                            className="h-6 w-6 text-slate-900 mb-4"
                            strokeWidth={1.5}
                          />
                          <span className="font-bold text-sm tracking-widest uppercase text-slate-900">
                            Mobile Money
                          </span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="bank"
                          id="bank"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="bank"
                          className="flex flex-col items-start p-6 border border-slate-200 bg-slate-50 hover:bg-slate-100 peer-data-[state=checked]:border-slate-900 peer-data-[state=checked]:bg-white cursor-pointer transition-all"
                        >
                          <Building2
                            className="h-6 w-6 text-slate-900 mb-4"
                            strokeWidth={1.5}
                          />
                          <span className="font-bold text-sm tracking-widest uppercase text-slate-900">
                            Institutional Transfer
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Account Name Inheritance */}
                  <div className="p-5 bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="sameAsUser"
                        checked={isAccountNameSameAsUser}
                        onCheckedChange={(checked) => {
                          setIsAccountNameSameAsUser(!!checked);
                          if (!checked) form.setValue("accountName", "");
                        }}
                        className="mt-1 rounded-none border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                      />
                      <div>
                        <label
                          htmlFor="sameAsUser"
                          className="text-xs font-bold uppercase tracking-widest text-slate-700 cursor-pointer"
                        >
                          Inherit Entity Name
                        </label>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">
                          Use Identity Profile Name for routing:{" "}
                          <span className="text-slate-900 font-bold">
                            {isAccountNameSameAsUser
                              ? `${watchedFirstName} ${watchedLastName}`.trim()
                              : "UNSET"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {!isAccountNameSameAsUser && (
                    <CustomInput
                      name="accountName"
                      label="Registered Account Name"
                      placeholder="e.g. Daniel Asante"
                      control={form.control}
                      type="text"
                      disabled={loading}
                    />
                  )}

                  {watchedPaymentMethod === "bank" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                      <CustomInput
                        name="bankName"
                        label="Bank Name"
                        placeholder="e.g. Ecobank"
                        control={form.control}
                        type="text"
                        disabled={loading}
                      />
                      <CustomInput
                        name="accountNumber"
                        label="Account Number"
                        placeholder="0000 0000 0000"
                        control={form.control}
                        type="text"
                        disabled={loading}
                      />
                    </div>
                  )}

                  {watchedPaymentMethod === "momo" && (
                    <div className="space-y-6 pt-4 border-t border-slate-200">
                      <CustomInput
                        name="momoNetwork"
                        label="Network Operator"
                        placeholder="e.g. MTN, Telecel"
                        control={form.control}
                        type="text"
                        disabled={loading}
                      />

                      <div className="p-5 bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="sameAsContact"
                            checked={isMomoSameAsContact}
                            onCheckedChange={(checked) => {
                              setIsMomoSameAsContact(!!checked);
                              if (!checked) form.setValue("momoNumber", "");
                            }}
                            className="mt-1 rounded-none border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                          />
                          <div>
                            <label
                              htmlFor="sameAsContact"
                              className="text-xs font-bold uppercase tracking-widest text-slate-700 cursor-pointer"
                            >
                              Inherit Contact Number
                            </label>
                            <p className="text-[10px] font-mono text-slate-400 mt-1">
                              Use Primary Phone for MoMo:{" "}
                              <span className="text-slate-900 font-bold">
                                {isMomoSameAsContact
                                  ? watchedContactNumber
                                  : "UNSET"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {!isMomoSameAsContact && (
                        <CustomInput
                          name="momoNumber"
                          label="Target Number"
                          placeholder="054..."
                          control={form.control}
                          type="text"
                          disabled={loading}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 3: Land Plot ── */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="border-b border-slate-200 pb-6 mb-8">
                    <h2 className="text-3xl font-serif text-slate-900 tracking-tight mb-2">
                      Spatial Assets
                    </h2>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                      Register primary geo-coordinates for verification.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput
                      name="region"
                      label="State / Region"
                      placeholder="e.g. Ashanti"
                      control={form.control}
                      type="text"
                      disabled={loading}
                    />
                    <CustomInput
                      name="village"
                      label="Local Settlement"
                      placeholder="e.g. Ejura"
                      control={form.control}
                      type="text"
                      disabled={loading}
                    />
                  </div>

                  <div className="p-6 bg-slate-50 border border-slate-200 flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-1">
                        Coordinate Mapping
                      </p>
                      <p className="text-xs text-slate-500 font-mono leading-relaxed">
                        Raw coordinates required for initial dMRV satellite
                        targeting and baseline biomass calculations.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput
                      name="latitude"
                      label="Latitude (Y)"
                      placeholder="6.1234"
                      control={form.control}
                      type="text"
                      disabled={loading}
                    />
                    <CustomInput
                      name="longitude"
                      label="Longitude (X)"
                      placeholder="-0.6543"
                      control={form.control}
                      type="text"
                      disabled={loading}
                    />
                  </div>

                  <CustomInput
                    name="areaHectares"
                    label="Estimated Scale (Hectares)"
                    placeholder="e.g. 2.5"
                    control={form.control}
                    type="text"
                    disabled={loading}
                  />
                </div>
              )}

              {/* ── Step 4: Assignment ── */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="border-b border-slate-200 pb-6 mb-8">
                    <h2 className="text-3xl font-serif text-slate-900 tracking-tight mb-2">
                      Finalization Protocol
                    </h2>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                      Establish chain-of-custody assignments.
                    </p>
                  </div>

                  <div className="p-8 bg-slate-50 border border-slate-200 space-y-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-1">
                        Account Custody
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        Current operative will be assigned as primary oversight
                        agent.
                      </p>
                    </div>

                    <CustomInput
                      name="partnerId"
                      label="Partner Organization Override (Optional)"
                      placeholder="Search registry..."
                      control={form.control}
                      type="text"
                      disabled={loading}
                    />

                    <div className="flex items-center justify-between py-4 border-t border-slate-200 mt-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Assignment Classification
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-900 bg-white border border-slate-200 px-3 py-1">
                        PRIMARY_AGENT
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Assign to Administrator
                      </Label>
                      <select
                        onChange={(e) =>
                          form.setValue("assignedAdminId", e.target.value)
                        }
                        className="w-full p-3 border border-slate-300 rounded-lg"
                      >
                        <option value="">Select an admin</option>
                        {admins.map((admin) => (
                          <option key={admin.id} value={admin.id}>
                            {admin.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="p-6 border border-amber-200 bg-amber-50 flex items-start gap-4">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-900 mb-1">
                        Compliance Hold
                      </p>
                      <p className="text-xs text-amber-800/70 font-mono leading-relaxed">
                        Entity status will default to PENDING_KYC. Manual
                        documentation review required before asset tokenization.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation Actions ── */}
          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
              className="rounded-none text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="rounded-none bg-slate-900 text-white hover:bg-emerald-900 px-8 py-6 text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Next Section <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="rounded-none bg-slate-900 text-white hover:bg-emerald-900 px-8 py-6 text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                {loading ? "Executing Protocol..." : "Finalize Registration"}
                {!loading && <CheckCircle2 className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
