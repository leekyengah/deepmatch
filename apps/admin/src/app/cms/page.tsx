import { Card } from "@/components/ui/Card";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function CmsPage() {
  const { t } = await getServerTranslator();
  const entries = [
    [t("admin.cmsFaq"), t("admin.cmsFaqDesc")],
    [t("admin.cmsPrivacy"), t("admin.cmsPrivacyDesc")],
    [t("admin.cmsNotify"), t("admin.cmsNotifyDesc")],
  ] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold text-dm-raspberry">{t("admin.cmsTitle")}</h1>
      <p className="mt-2 text-sm text-dm-muted">{t("admin.cmsIntro")}</p>
      <ul className="mt-6 space-y-3">
        {entries.map(([title, note]) => (
          <li key={title}>
            <Card>
              <h2 className="font-semibold text-dm-raspberry">{title}</h2>
              <p className="mt-1 text-sm text-dm-muted">{note}</p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
