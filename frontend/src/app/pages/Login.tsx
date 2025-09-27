import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  return <h1 className="text-3xl font-bold underline">{t("login.title")}</h1>;
}
