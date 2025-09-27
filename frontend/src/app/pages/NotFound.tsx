import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center items-center h-screen">
      <h1 className="text-3xl font-bold underline">{t("notFound.message")}</h1>
    </div>
  );
}
