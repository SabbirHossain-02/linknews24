"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import { HospitalList } from "@/components/directory/HospitalList";
import { ServiceJoinCta } from "@/components/directory/ServiceJoinCta";

export default function Page() {
  const { t } = useLocale();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <h1 className="text-2xl font-bold text-heading sm:text-3xl">
        {t("svcHospitalTitle")}
      </h1>
      <p className="mt-2 max-w-3xl font-ui text-sm text-foreground-muted">
        {t("svcHospitalIntro")}
      </p>

      <ServiceJoinCta service="hospital" />

      <div className="mt-6">
        <HospitalList />
      </div>
    </main>
  );
}
